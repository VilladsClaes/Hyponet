using hyponet_api.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Neo4j.Driver;
using Newtonsoft.Json;
using NReco.Logging.File;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using LogLevel = Microsoft.Extensions.Logging.LogLevel;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace hyponet_api.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class RelationController : ControllerBase
    {
        private readonly IDriver _driver;
        private readonly ILogger<FileLogger> _logger;
        public RelationController(INeo4jDriverOptions neo4jDriverCredentials, ILogger<FileLogger> logger)
        {
            _driver = GraphDatabase.Driver(neo4jDriverCredentials.Uri, AuthTokens.Basic(neo4jDriverCredentials.User, neo4jDriverCredentials.Password));
            _logger = logger;
        }

        [HttpGet("[action]/{test}")]
        public string TestConnection(string test)
        {
            _logger.Log(LogLevel.Information, $"RelationController.TestConnection called");
            var teststring = $"Der er forbindelse til {test}";

            return teststring;
        }

        [HttpPost("[action]")]
        public List<string> Create()
        {
            var res = new List<string>();
            var form = Request.Form;
            var fromNodeId = form["fromNodeId"].ToString();
            var toNodeId = form["toNodeId"].ToString();
            var relationType = form["relationType"].ToString();
            _logger.Log(LogLevel.Information, $"RelationController.Create() start:  fromNodeId = {fromNodeId} | toNodeId = {toNodeId} | relationType = {relationType}");

            if (!int.TryParse(fromNodeId, out var fromId) || !int.TryParse(toNodeId, out var toId) || !IsValidIdentifier(relationType))
            {
                return new List<string> { "Error: invalid fromNodeId, toNodeId or relationType." };
            }

            try
            {
                var mergeRelationships =
                              $"WITH n,l " +
                              "CALL apoc.merge.relationship(n,$relationType" +
                              ",{},{},l,{}) YIELD rel " +
                              "RETURN rel ";

                var neo4jQuery =
                            "MATCH(n) WHERE ID(n) = $fromNodeId " +
                            "MATCH(l) WHERE ID(l) = $toNodeId " +
                            $"MERGE (n)-[r:{relationType}]->(l) " +
                            mergeRelationships;

                var statementResult = _driver.Session().Run(neo4jQuery,
                    new { fromNodeId = fromId, toNodeId = toId, relationType });
                _logger.Log(LogLevel.Information, $"RelationController.Create() ran neo4j query and received statement result");
                res = statementResult.Select(record => JsonConvert.SerializeObject(record[0].As<IRelationship>(), Formatting.Indented)).ToList();
                _logger.Log(LogLevel.Information, $"RelationController.Create() retrieved record list from statement result = {res.Count}");

            }
            catch (Exception ex)
            {
                _logger.LogCritical($"RelationController.Create() EXCEPTION CAUGHT", ex);
                throw ex;
            }

            return res;
        }

        [HttpGet("[action]/{fromNodeId}/{toNodeId}/{relationType}")]
        public List<string> Delete(string fromNodeId, string toNodeId, string relationType)
        {
            var res = new List<string>();

            if (!int.TryParse(fromNodeId, out var fromId) || !int.TryParse(toNodeId, out var toId) || !IsValidIdentifier(relationType))
            {
                return new List<string> { "Error: invalid fromNodeId, toNodeId or relationType." };
            }

            try
            {
                var neo4jQuery = $"MATCH (n)-[r:{relationType}]->(l) " +
                                 "WHERE ID(n) = $fromNodeId AND ID(l) = $toNodeId " +
                                 "DELETE r";

                var statementResult = _driver.Session().Run(neo4jQuery, new { fromNodeId = fromId, toNodeId = toId });
                var stringBuilder = new StringBuilder();
                res = statementResult.Select(record => record[0].As<string>()).ToList();
            }
            catch (Exception ex)
            {
                throw ex;
            }

            return res;
        }

        private static readonly Regex IdentifierPattern = new Regex("^[A-Za-z_][A-Za-z0-9_]*$");

        // Labels and relationship types cannot be Cypher parameters, so they are whitelisted by pattern instead.
        private static bool IsValidIdentifier(string value) => value != null && IdentifierPattern.IsMatch(value);

        public void Dispose()
        {
            _driver?.Dispose();
        }

    }
}
