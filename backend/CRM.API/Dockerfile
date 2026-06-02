FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /app
COPY . /app/backend/
WORKDIR /app/backend
RUN dotnet publish CRM.API/CRM.API.csproj -c Release -o out

FROM mcr.microsoft.com/dotnet/aspnet:9.0
WORKDIR /app
COPY --from=build /app/backend/out .
EXPOSE 8080
ENTRYPOINT ["dotnet", "CRM.API.dll"]
