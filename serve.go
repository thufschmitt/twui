package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"os/exec"
	"strconv"
	"strings"
)

func init() {
	cmdServe.Run = runServe
	cmdServe.Flag.IntVar(&port, "p", 2718, "port to listen on")
}

var cmdServe = &Command {
	UsageLine: "serve",
	Short:     "serve",
	Long: `
serve runs a server that provides a web UI for task warrior

serve supports the following flags:

	-p
		port on which serve listens for requests
		The default port is 2718.

`,
}

const (
	taskExeName = "task"
	staticDir = "public"
	defaultPort = 2718
)

var (
	taskDataDir string
	port int
)

func runServe(c *Command, args []string) {
	fs := http.FileServer(http.Dir("public"))
	http.Handle("/", fs)

	http.HandleFunc("/tasks", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case "GET":
			fetchTasks(w, r)
		default:
			http.Error(w, "Not Found", http.StatusNotFound)
		}
	})

	log.Fatal(http.ListenAndServe(":" + strconv.Itoa(port), nil))
}

func fetchTasks(w http.ResponseWriter, r *http.Request) {
	cmd := exec.Command(taskExeName, "export")
	var env []string
	for _, v := range os.Environ() {
		if strings.HasPrefix(v, "TASKDATA=") {
			env = append(env, v)
		}
	}
	cmd.Env = env
	rawTasks, err := cmd.Output()
	if err != nil {
		log.Printf("task warrior failed: %v\n", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	var tasks []Task
	decoder := json.NewDecoder(bytes.NewReader(rawTasks))
	for {
		if err := decoder.Decode(&tasks); err == io.EOF {
			break
		} else if err != nil {
			log.Printf("malformed task warrior data: %v\n", err)
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			return
		}
	}

	tasksJSON, err := json.Marshal(tasks)
	if err != nil {
		log.Printf("could not encode task list: %v\n", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json;charset=UTF-8")
	fmt.Fprintf(w, "%s", tasksJSON)
}
