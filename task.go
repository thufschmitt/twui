package main

import (
	"bytes"
	"encoding/json"
	"io"
	"log"
	"os"
	"os/exec"
	"strings"
)

type Task struct {
	Id          int          `json:"id"`
	Status      string       `json:"status"`
	UUID        string       `json:"uuid"`
	Entry       string       `json:"entry"`
	Description string       `json:"description"`
	Start       string       `json:"start"`
	End         string       `json:"end"`
	Due         string       `json:"due"`
	Until       string       `json:"until"`
	Wait        string       `json:"wait"`
	Modified    string       `json:"modified"`
	Scheduled   string       `json:"scheduled"`
	Recur       string       `json:"recur"`
	Parent      string       `json:"parent"`
	Project     string       `json:"project"`
	Priority    string       `json:"priority"`
	Depends     string       `json:"depends"`
	Tags        []string     `json:"tags"`
	Annotations []Annotation `json:"annotations"`
	Urgency     float32      `json:"urgency"`
}

type Annotation struct {
	Entry       string `json:"entry"`
	Description string `json:"description"`
}

// FetchTasks returns a filtered list of tasks exported from taskwarrior
func FetchTasks(filter string) ([]Task, error) {
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
		return nil, err
	}

	var tasks []Task
	decoder := json.NewDecoder(bytes.NewReader(rawTasks))
	for {
		if err := decoder.Decode(&tasks); err == io.EOF {
			break
		} else if err != nil {
			log.Printf("malformed task warrior data: %v\n", err)
			return nil, err
		}
	}

	return tasks, nil
}
