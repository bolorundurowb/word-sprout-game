using System.Reflection;
using FluentValidation;
using IGeekFan.AspNetCore.RapiDoc;
using meerkat;
using WordSproutApi.Utilities;
using SharpGrip.FluentValidation.AutoValidation.Mvc.Extensions;
using WordSproutApi.Hubs;


var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddSignalR();
builder.Services.AddCors(options =>
{
    options.AddPolicy("CORSPolicy",
        opts => opts
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials()
            .SetIsOriginAllowed(_ => true)
    );
});
builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();


builder.Services.AddValidatorsFromAssembly(Assembly.GetExecutingAssembly());
builder.Services.AddFluentValidationAutoValidation(cfg =>
{
    cfg.DisableBuiltInModelValidation = true;
    cfg.OverrideDefaultResultFactoryWith<CustomValidationResultFactory>();
});

builder.Services.AddAutoMapper(typeof(Program));

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

app.UseCors("CORSPolicy");
app.UseRouting();

app.UseAuthorization();
app.UseHttpsRedirection();

app.MapControllers();
app.MapHub<GameHub>("/rt/v1/games");

app.Run();
