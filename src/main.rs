use topcoat::{
    Result,
    router::{module_router, page},
    view::{View, component, view},
};

mod api;
mod health;

#[tokio::main]
async fn main() {
    topcoat::start(module_router!().build()).await.unwrap();
}

#[page]
async fn home() -> Result<impl View> {
    Ok(view! {
        <!DOCTYPE html>
        <html>
            <head>
                <title>"Demo App"</title>
                topcoat::dev::script()
            </head>
            <body>
                hello(name: "World")
                <p><a href="/api">"JSON API"</a></p>
            </body>
        </html>
    })
}

#[component]
async fn hello(name: &str) -> Result<impl View> {
    Ok(view! { <h1>"Hello, " (name) "!"</h1> })
}
