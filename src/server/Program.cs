using System.Reflection;
using FluentValidation;
using IGeekFan.AspNetCore.RapiDoc;
using meerkat;
using WordSproutApi.Utilities;
using SharpGrip.FluentValidation.AutoValidation.Mvc.Extensions;


var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
    {
        Title = "Word Sprout API",
        Version = "v1"
    });
});


builder.Services.AddValidatorsFromAssembly(Assembly.GetExecutingAssembly());
builder.Services.AddFluentValidationAutoValidation(cfg =>
{
    cfg.DisableBuiltInModelValidation = true;
    cfg.OverrideDefaultResultFactoryWith<CustomValidationResultFactory>();
});

// connect to the database
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

if (string.IsNullOrWhiteSpace(connectionString))
    throw new ArgumentException("No connection string found", nameof(connectionString));

Meerkat.Connect(connectionString);


var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseRapiDocUI(c =>
    {
        c.GenericRapiConfig = new GenericRapiConfig
        {
            RenderStyle = "read",
            Theme = "light",
            SchemaStyle = "table"
        };
    });
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
