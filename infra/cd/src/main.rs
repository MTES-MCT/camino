use std::convert::Infallible;
use std::env;
use std::process::Command;
use warp::http::StatusCode;
use warp::{Filter};

//FIXME docker run -ti -w /workspace -v $PWD:/workspace rust:1-buster cargo build --release
#[tokio::main]
async fn main() {
    let token = env::var("CD_TOKEN").expect("$CD_TOKEN not set!");

    warp::serve(update(token)).run(([127, 0, 0, 1], 3030)).await;
}

fn string_to_str(s: String) -> &'static str {
    Box::leak(s.into_boxed_str())
}

#[derive(Debug)]
struct Unauthorized;
impl warp::reject::Reject for Unauthorized {}

pub fn update(
    token: String,
) -> impl Filter<Extract = impl warp::Reply, Error = warp::Rejection> + Clone{

    let tt = token.clone();


        let admin_only = warp::header::exact("authorization", string_to_str(tt));

        warp::path!("update" / String)
            .and(
                admin_only
            ).and_then(deploy_version)
}

async fn deploy_version(sha: String) -> Result<impl warp::Reply, Infallible> {
     let command = Command::new("docker-compose")
         .args(["up", "-d"])
         .env("CAMINO_TAG", sha)
        .current_dir("/srv/www/camino/")
         .output();
    match command {
        Ok(command_output) => {
            if command_output.status.success() {
                Ok(warp::reply::with_status(command_output.stdout, StatusCode::OK))
            } else {
                Ok(warp::reply::with_status(command_output.stderr, StatusCode::SERVICE_UNAVAILABLE))
            }
        },
        Err(err) => {
            Ok(warp::reply::with_status(err.to_string().as_bytes().to_vec(), StatusCode::INTERNAL_SERVER_ERROR))
        }
    }
}
