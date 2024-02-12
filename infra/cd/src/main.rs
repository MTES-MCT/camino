use std::convert::Infallible;
use std::env;
use std::net::{IpAddr, Ipv4Addr, SocketAddr};
use std::process::Command;
use warp::http::StatusCode;
use warp::Filter;

#[tokio::main]
async fn main() {
    let token = env::var("CD_TOKEN").expect("CD_TOKEN not set!");
    let port: u16 = env::var("CD_PORT").map_or_else(
        |_| 3030,
        |port| port.parse::<u16>().expect("CD_PORT should be a string"),
    );

    let socket = SocketAddr::new(IpAddr::V4(Ipv4Addr::new(0, 0, 0, 0)), port);

    warp::serve(update(token)).run(socket).await;
}

fn string_to_str(s: String) -> &'static str {
    Box::leak(s.into_boxed_str())
}

#[derive(Debug)]
struct Unauthorized;
impl warp::reject::Reject for Unauthorized {}

pub fn update(
    token: String,
) -> impl Filter<Extract = impl warp::Reply, Error = warp::Rejection> + Clone {
    let tt = token.clone();

    let admin_only = warp::header::exact("authorization", string_to_str(tt));

    warp::path!("update" / String)
        .and(admin_only)
        .and_then(deploy_version)
}

async fn deploy_version(sha: String) -> Result<impl warp::Reply, Infallible> {
    let command = Command::new("docker")
        .args(["compose", "up", "-d"])
        .env("CAMINO_TAG", sha)
        .current_dir("/srv/www/camino/")
        .output();
    match command {
        Ok(command_output) => {
            if command_output.status.success() {
                Ok(warp::reply::with_status(
                    command_output.stdout,
                    StatusCode::OK,
                ))
            } else {
                Ok(warp::reply::with_status(
                    command_output.stderr,
                    StatusCode::SERVICE_UNAVAILABLE,
                ))
            }
        }
        Err(err) => Ok(warp::reply::with_status(
            err.to_string().as_bytes().to_vec(),
            StatusCode::INTERNAL_SERVER_ERROR,
        )),
    }
}
