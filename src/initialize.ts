if (!process.env.DOCKER_ENV) {
  let { config } = await import('@dotenvx/dotenvx');

  config();
}
