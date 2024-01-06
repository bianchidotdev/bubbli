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
		WithExposedPort(5432).
		AsService()

	// set up elixir container
	// TODO(bianchi): read versions from .mise.toml
	elixir := client.Container().
		From("elixir:1.16"). // slim doesn't have make installed - should we use elixir or hexpm/elixir?
		WithDirectory("/app", client.Host().Directory("app"), dagger.ContainerWithDirectoryOpts{
			Exclude: []string{"app/priv/", "app/build/", "app/deps/", "app/doc/", "ci/", "web"},
		})

	depsCache := client.CacheVolume("deps")
	buildCache := client.CacheVolume("build")

	// set the working directory in the container
	// install application dependencies
	runner := elixir.
		WithServiceBinding("db", postgres).
		WithEnvVariable("DB_HOST", "db").
		WithEnvVariable("MIX_ENV", "test").
		WithWorkdir("/app").
		WithMountedCache("/app/deps", depsCache).
		WithMountedCache("/app/_build", buildCache).
		WithExec([]string{"mix", "local.hex", "--force"}).
		WithExec([]string{"mix", "deps.get"}).
		WithExec([]string{"mix", "deps.compile"})

		// TODO(bianchi): https://docs.dagger.io/7442989/cookbook/#perform-multi-stage-build

		// run application tests
	out, err := runner.
		WithExec([]string{"mix", "test"}).
		Stderr(ctx)
	if err != nil {
		panic(err)
	}
	fmt.Println(out)
}
