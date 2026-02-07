[
  import_deps: [
    :ash_authentication,
    :ash_json_api,
    :ash_postgres,
    :ash,
    :reactor,
    :ecto,
    :ecto_sql,
    :phoenix
  ],
  subdirectories: ["priv/*/migrations"],
  inputs: ["*.{ex,exs}", "{config,lib,test}/**/*.{ex,exs}", "priv/*/seeds.exs"],
  plugins: [Spark.Formatter]
]
