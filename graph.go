package main

import (
	"bufio"
	"fmt"
	"io"
	"log"
	"os"
	"os/exec"
	"runtime"
)

func init() {
	cmdGraph.Run = runGraph

	if runtime.GOOS == "windows" {
		home := os.Getenv("HOMEDRIVE") + os.Getenv("HOMEPATH")
		if home == "" {
			home = os.Getenv("USERPROFILE")
		}
		outputFilepath = home
	} else {
		outputFilepath = os.Getenv("HOME")
	}
	outputFilepath += "/" + defaultOutputFilename
}

var cmdGraph = &Command {
	UsageLine: "graph [filter]",
	Short:     "graph",
	Long: `
graph produces a directed-acylic graph of tasks based on dependencies

graph optionally takes a filter to limit the tasks displyed.
The filter syntax is identical to taskwarrior's syntax.

`,
}

const (
	defaultOutputFilename = "task_graph.png"
	penWidth = 1
	blockedColor = "#BA8BAF"
	maxUrgencyColor = "#DC9656"
	unblockedColor = "#7CAFC2"
	doneColor = "#B8B8B8"
	waitColor = "#A16946"
	deletedColor = "#86C1B9"
	defaultColor = "#F8F8F8"
)

var outputFilepath string

func runGraph(c *Command, args []string) {
	tasks, err := FetchTasks(args...)
	if err != nil {
		log.Fatalf("Error fetching tasks\n")
	}
	digraph := generateDigraph(tasks)
	dot := exec.Command("dot", "-T", "png")
	stdin, err := dot.StdinPipe()
	if err != nil {
		log.Fatal(err)
	}
	stdout, err := dot.StdoutPipe()
	if err != nil {
		log.Fatal(err)
	}

	if err = dot.Start(); err != nil {
		log.Fatal(err)
	}
	go func(cmds []byte, in io.WriteCloser) {
		defer in.Close()
		for {
			n, err := in.Write(cmds)
			switch(err) {
			case os.ErrInvalid:
				log.Printf("could not write to dot pipe: %s\n", err)
				return
			case io.ErrShortWrite:
				cmds = cmds[n:]
			default:
				return
			}
		}
	}(digraph, stdin)

	out, err := os.Create(outputFilepath)
	if err != nil {
		log.Fatal(err)
	}

	r := bufio.NewReader(stdout)
	r.WriteTo(out)

	err = dot.Wait()
	if err != nil {
		log.Fatal(err)
	}
	out.Close()
}

func generateDigraph(tasks []Task) []byte {
	dg := []byte("digraph dependencies { splines=true; overlap=ortho; rankdir=LR; weight=2;")

	pendingUUIDs := make(map[string]bool)
	maxUrgency := float32(-999.9);
	for _, task := range tasks {
		if task.Status == "pending" {
			pendingUUIDs[task.UUID] = true
			if task.Urgency > maxUrgency {
				maxUrgency = task.Urgency
			}
		}
	}

	validUUIDs := make(map[string]bool)
	for _, task := range tasks {
		validUUIDs[task.UUID] = true
		style := "filled"
		color := ""
		prefix := ""

		switch task.Status {
		case "pending":
			prefix = fmt.Sprintf("%d", task.Id)
			color = unblockedColor
			for _, dep := range task.Dependencies() {
				if pendingUUIDs[dep] {
					color = blockedColor
					break
				}
			}
		case "waiting":
			prefix = "WAIT"
			color = waitColor
		case "completed":
			prefix = "DONE"
			color = doneColor
		case "deleted":
			prefix = "DELETED"
			color = deletedColor
		default:
			color = defaultColor
		}

		if task.Urgency == maxUrgency {
			color = maxUrgencyColor
		}

		dg = append(dg, []byte(fmt.Sprintf("\"%s\"[shape=box][penwidth=%d][label=\"%s:%s\"][fillcolor=\"%s\"][style=%s]\n",
		                       task.UUID,
				       penWidth,
				       prefix,
				       task.Description,
				       color,
				       style))...)
	}

	for _, task := range tasks {
		for _, dep := range task.Dependencies() {
			if !validUUIDs[dep] {
				continue
			}
			dg = append(dg, []byte(fmt.Sprintf("\"%s\" -> \"%s\";\n", dep, task.UUID))...)
		}
	}

	dg = append(dg, '}')
	return dg
}
