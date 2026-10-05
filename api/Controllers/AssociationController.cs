using hyponet_api.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Neo4j.Driver;

namespace hyponet_api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AssociationController : ControllerBase
    {
        private readonly IDriver _driver;

        public AssociationController(INeo4jDriverOptions neo4jDriverCredentials)
        {
            _driver = GraphDatabase.Driver(neo4jDriverCredentials.Uri, AuthTokens.Basic(neo4jDriverCredentials.User, neo4jDriverCredentials.Password));
        }
    }
}