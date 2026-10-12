FROM rust:1.82 AS builder
WORKDIR /app
COPY Cargo.toml ./
COPY src ./src
COPY migrations ./migrations
RUN cargo build --release

FROM public.ecr.aws/lambda/provided:al2023
COPY --from=builder /app/target/release/usernames-api /var/task/bootstrap
CMD ["bootstrap"]
