package main

import (
	"context"
	"fmt"
	"os"

	"dagger.io/dagger"
)

// TODO(bianchi): break up the CI
// https://github.com/thechangelog/changelog.com/blob/master/magefiles/image/test.go

func main() {
	ctx := context.Background()

	// initialize Dagger client
	client, err := dagger.Connect(ctx, dagger.WithLogOutput(os.Stdout))
	if err != nil {
		panic(err)
	}
	defer client.Close()

	// set up postgres container for testing
	postgres := client.Container().
		From("postgres:15-alpine").
		WithEnvVariable("POSTGRES_USER", "postgres").
		WithEnvVariable("POSTGRES_PASSWORD", "postgres").
		WithExposedPort(5432)

	// set up elixir container
	// TODO(bianchi): read versions from .rtx.toml
	elixir := client.Container().
		From("hexpm/elixir:1.15.2-erlang-26.0.2-debian-bookworm-20230612-slim").
		WithDirectory("/app", client.Host().Directory("back"), dagger.ContainerWithDirectoryOpts{
			Exclude: []string{"back/priv/", "ci/", "front/"},
		})

	// set the working directory in the container
	// install application dependencies
	runner := elixir.
		WithServiceBinding("db", postgres).
		WithEnvVariable("DB_HOST", "db").
		WithEnvVariable("MIX_ENV", "test").
		WithWorkdir("/app").
		WithExec([]string{"mix", "local.hex", "--force"}).
		WithExec([]string{"mix", "deps.get"})

		// run application tests
	out, err := runner.
		WithExec([]string{"mix", "test"}).
		Stderr(ctx)
	if err != nil {
		panic(err)
	}
	fmt.Println(out)
}