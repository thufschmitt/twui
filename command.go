package main

import (
	"flag"
	"fmt"
	"os"
	"strings"
)

// Command is an implementation of a subcommand
type Command struct {
	// Run implements 'main' for the command.
	Run func(cmd *Command, args []string)

	// UsageLine is the one line usage message.
	UsageLine string

	// Short is the short description shown in the help output.
	Short string

	// Long is the long message shown in the 'help <this-command>' output.
	Long string

	// Flag is a set of flags specific to this command.
	Flag flag.FlagSet

	// CustomFlags indicates that the command will do its own flag parsing.
	CustomFlags bool
}

// Name returns the command's name: the first word in the usage line.
func (c *Command) Name() string {
	name := c.UsageLine
	i := strings.Index(name, " ")
	if i >=0 {
		name = name[:i]
	}
	return name
}

// Usage prints the command's usage string to stderr
func (c *Command) Usage() {
	fmt.Fprintf(os.Stderr, "usage: %s\n\n", c.UsageLine)
	fmt.Fprintf(os.Stderr, "%s\n", strings.TrimSpace(c.Long))
	os.Exit(2)
}

// Runnable reports whether the command can be run or is documentation of a pseudo-command
func (c *Command) Runnable() bool {
	return c.Run != nil
}
