package main

import (
	"log"
)

var Commit string
var Version string

func init() {
	cmdVersion.Run = runVersion
}

var cmdVersion = &Command{
	UsageLine: "version",
	Short:     "Display version information",
	Long: `
	Version displays the commit id and version of this executable
`,
}

func runVersion(c *Command, args []string) {
	log.Printf("twui\n\tcommit-id: %s\n\tversion: %s\n", Commit, Version)
}
