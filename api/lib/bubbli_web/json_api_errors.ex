defimpl AshJsonApi.ToJsonApiError, for: Ash.Error.Query.ReadActionRequiresActor do
  def to_json_api_error(_error) do
    %AshJsonApi.Error{
      id: Ash.UUID.generate(),
      status_code: 401,
      code: "unauthenticated",
      title: "Unauthenticated",
      detail: "This action requires an authenticated user",
      meta: %{}
    }
  end
end
