using hyponet_api.Interfaces;
using hyponet_api.Models;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace hyponet_api
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }


        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddLogging(loggingBuilder =>
            {
                loggingBuilder.AddFile("hyponet_api_test.log", append: true);
            });

            INeo4jDriverOptions neo4jDriverOptions = new Neo4jConfiguration();
            Configuration.Bind($"Neo4j", neo4jDriverOptions);
            services.AddSingleton(neo4jDriverOptions);

            services.AddCors(options =>
            {
                options.AddDefaultPolicy(
                    builder =>
                    {
                        builder.WithOrigins("http://localhost:50255", "http://localhost:50546", "https://localhost:44380", "https://villadsclaes.dk", "https://api.villadsclaes.dk", "https://villadsclaes.dk/", "http://localhost:8080").AllowAnyHeader().AllowAnyMethod();
                       
                    });
               
            });


            services.AddControllers();

        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }

            app.UseHttpsRedirection();

            app.UseRouting();

            app.UseCors();

            app.UseAuthorization();

            app.UseEndpoints(endpoints =>
            {

                endpoints.MapControllerRoute(
                    name: "default",
                    pattern: "{controller}/{action}"
                    /*defaults: new { controller = "RootNode", action = "Create" }*/);
            });




        }
    }
}
