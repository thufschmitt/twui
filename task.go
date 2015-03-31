package main

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
