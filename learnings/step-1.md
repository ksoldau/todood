# Step 1: Docker + Postgres Setup

## Learning Questions
###  Why Docker instead of installing Postgres directly on the machine?
[@ksoldau] To get rid of the "it runs on my machine" problem between multiple developers or dev/test/prod servers. Also, if end up with multiple projects that all want diff versions, extensions, or seed data it can get messy without Docker containers. 

A Docker container is a self-contained, isolated environemnt that incldues everything a piece of software needs to run: code, runtime, libs, config. It runs on top of Docker, which runs on your operating system. It's different to a virtual machine because a v irtual machine also emulates a full operating system. A container shares the operating system's kernel but isolates everything else. You can run dozens of them on one machine. 

A *Dockerfile* is a plain text file that says how to build the container. A *Docker image* is what you get when you build a *Dockerfile*. A *Docker container* is a running instance of a *Docker image*. You can run multiple containers from the same image. A *Docker Hub* is a public regitry where *Docker images* are stored and shared. *Docker volumes* are storage areas that exist outside the container and persist. 

(A lot of notes taken from https://www.digitalcitizen.life/what-is-docker-and-why-developers-use-it-instead-of-installing-software-directly/.)

### What does docker-compose do, and why use it instead of raw Docker commands?
[@ksoldau] Docker compose is better than using raw Docker commands because it's more easily reproducible.

Docker compose is used to define and run multi-container applications. It allows the services, networks, and volumes to be managed in a single YAML configuration file. Works in all environments - production, staging, development, testing, CI. It contains raw docker commands, so it's kind of just short hand for doing the same commands a bunch. 

(Notes taken from https://docs.docker.com/compose/intro/features-uses/.)

### What Postgres configuration options matter (password, database name, ports, volumes) and why?

### How to verify Postgres is actually running and ready to accept connections?
[@ksoldau] Use the `healhcheck` param and test using the `pg_isready` command. If we didn't verify it was ready we could see errors by trying to connect to Postgres after container ready but Postgres not.