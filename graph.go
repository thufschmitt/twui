package main

import (
	"bufio"
	"fmt"
	"io"
	"log"
	"os"
	"os/exec"
	"runtime"
	"strings"
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
)

var outputFilepath string

func runGraph(c *Command, args []string) {
	filter := strings.Join(args, " ")
	tasks, err := FetchTasks(filter)
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

	for _, task := range tasks {
		style := "filled"
		color := "white"
		dg = append(dg, []byte(fmt.Sprintf("\"%s\"[shape=box][penwidth=%d][label=\"%d:%s\"][fillcolor=%s][style=%s]\n",
		                       task.UUID,
				       penWidth,
				       task.Id,
				       task.Description,
				       color,
				       style))...)
	}

	dg = append(dg, '}')
	return dg
}
