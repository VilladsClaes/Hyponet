using hyponet_api.Interfaces;
using hyponet_api.Models;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Hosting;
using Neo4j.Driver;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Text.RegularExpressions;

namespace hyponet_api.Controllers
{
    /// <summary>
    ///     Kalder med en GET-request ind på URL som DNS-viderestiller til egen hostet server:
    ///     https://www.api.villadsclaes.dk
    ///     Hvis projektet ikke er udgivet kalder den på:
    ///     bolt://localhost:7687"
    ///     Hvis projektet er hostet på aura, udgives projektet til www.aura.villadsclaes.dk
    /// </summary>
    [ApiController]
    [Route("[controller]")]
    public class NodeController : ControllerBase
    {
        private readonly IDriver _driver;
        private readonly IWebHostEnvironment _environment;

        public NodeController(INeo4jDriverOptions neo4jDriverCredentials, IWebHostEnvironment environment)
        {
            _environment = environment;
            _driver = GraphDatabase.Driver(
                neo4jDriverCredentials.Uri,
                AuthTokens.Basic(neo4jDriverCredentials.User,
                neo4jDriverCredentials.Password));
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="test"> 
        /// 
        /// returnerer Hyponet
        /// 
        /// </param>
        /// <returns></returns>
        [HttpGet]
        [Route("[action]")]
        public string TestConnection(string test)
        {
            var neo4jQuery = $"MATCH (n) RETURN n LIMIT 1";

            var statementResultSet = _driver.Session().Run(neo4jQuery);
            var listOfJsonObjects = CreateListOfJsonNodeObjects(statementResultSet);

            return listOfJsonObjects;
        }

       
        [HttpPost]
        [Route("[action]")]
        public string Create()
        {
            var form = Request.Form;

            if (string.IsNullOrEmpty(form["name"]) || string.IsNullOrEmpty(form["type"]))
            {
                return "Error: name and / or type were null or empty.";
            }

            var name = form["name"].ToString();
            var type = form["type"].ToString();

            if (!IsValidIdentifier(type))
            {
                return "Error: invalid type.";
            }

            var neo4jQuery =
                $"CREATE (n:{type} {{name:$name}}) SET n.creationTime = timestamp() RETURN n";

            if (type.ToLower() == "ass")
            //Merge to avoid creating duplicate ass nodes
            {
                neo4jQuery =
                    $"MERGE (n:{type} {{name:$name}}) SET n.creationTime = timestamp() RETURN n AS node";
            }

            var statementResultSet = _driver.Session().Run(neo4jQuery, new { name });
            var listOfJsonObjects = CreateListOfJsonNodeObjects(statementResultSet);

            return listOfJsonObjects;
        }

        /// <summary>
        ///     Used when creating mark nodes.
        /// </summary>
        /// <returns></returns>
        [HttpPost]
        [Route("[action]")]
        public string CreateMarkNode()
        {
            var form = Request.Form;
            var name = form["name"].ToString();
            var type = form["type"].ToString();
            var rangeStart = form["rangeStart"].ToString();
            var rangeEnd = form["rangeEnd"].ToString();
            var preceedingChar = form["preceedingChar"].ToString();
            var succeedingChar = form["succeedingChar"].ToString();

            if (!IsValidIdentifier(type) || !int.TryParse(rangeStart, out var start) || !int.TryParse(rangeEnd, out var end))
            {
                return "Error: invalid type or range.";
            }

            var neo4jQuery =
                $"CREATE (n:{type} {{name:$name, range:[$rangeStart,$rangeEnd], morfem:[$preceedingChar,$succeedingChar]}}) " +
                "SET n.creationTime = timestamp() " +
                "RETURN n";

            var statementResultSet = _driver.Session().Run(neo4jQuery,
                new { name, rangeStart = start, rangeEnd = end, preceedingChar, succeedingChar });
            var listOfJsonObjects = CreateListOfJsonNodeObjects(statementResultSet);

            return listOfJsonObjects;
        }

        [HttpPost("[action]")]
        public string CreateImage()
        {
            var form = Request.Form;
            var fileName = form["fileName"].ToString();
            var fileType = form["type"].ToString();

            if (!IsValidIdentifier(fileType))
            {
                return "Error: invalid type.";
            }

            var neo4jQuery =
                $"CREATE (n:{fileType} {{name:$fileName}}) SET n.creationTime = timestamp() RETURN n";

            var statementResultSet = _driver.Session().Run(neo4jQuery, new { fileName });
            var listOfJsonObjects = CreateListOfJsonNodeObjects(statementResultSet);

            return listOfJsonObjects;
        }

        [Obsolete]
        [HttpGet("[action]/{nodeID}")]
        public string FindMarkToExtendSelectionTo(int nodeID)
        {
            //For den netop oprettede node
            //Find alle MARK overalt
            //udvælg de MARK som er i denne node
            //giv mig en liste med de mark
            var neo4jQuery =
            "MATCH(a) WHERE a:SPEC OR  a:ROOT " +
            "WITH a " +
            $"MATCH(a) WHERE ID(a)={nodeID} " +
            "WITH a " +
            "MATCH(b: MARK)--> () " +
            "WHERE a.name CONTAINS b.name " +
            "RETURN b";

            var statementResultSet = _driver.Session().Run(neo4jQuery);
            var listOfJsonObjects = CreateListOfJsonNodeObjects(statementResultSet);

            return listOfJsonObjects;
        }

        [HttpPost("[action]")]
        public string FindAssToRelateTo()
        {
            var form = Request.Form;
            string formid = form["id"].ToString();
            int nodeID = Int32.Parse(formid);




            var alleASS =
                $"MATCH(association:ASS)<-[:Ass]-(:SPEC)<-[:Spec]-(markering:MARK)" +
                $" WITH association, markering, (markering.morfem[0] + markering.name + markering.morfem[1]) AS markAndMorfem";

            var denneNode =
                $" MATCH(dennenode) WHERE ID(dennenode)={nodeID}";
               
               

            var undtagenSinEgen =
                $" AND(' ' + dennenode.name + ' ') CONTAINS markAndMorfem AND NOT(dennenode)-[:Mark]->(:MARK)-[:Spec]->(:SPEC)-[:Ass]->(association)" +
                $" AND markering.name=association.name" +
                $" RETURN association AS node";

            var neo4jQuery = alleASS + denneNode + undtagenSinEgen;
            var statementResultSet = _driver.Session().Run(neo4jQuery);
            var listOfJsonObjects = CreateListOfJsonNodeObjects(statementResultSet);

            return listOfJsonObjects;
        }



        [Obsolete]
        [HttpGet("[action]/{specID}")]
        public string FindMarkNodesInSpec(int specID)
        {

            var neo4jQuery =
            $"MATCH(a) WHERE ID(a)={specID} " +
            "WITH a " +
            "MATCH(n) " +
            "WHERE(n: MARK) AND a.name CONTAINS n.name " +
            "RETURN n";

            var statementResultSet = _driver.Session().Run(neo4jQuery);
            var listOfJsonObjects = CreateListOfJsonNodeObjects(statementResultSet);

            return listOfJsonObjects;
        }


        [Obsolete]
        [HttpGet("[action]/{markName}/{type}/{rangeStart}/{rangeEnd}/{preceedingChar}/{succeedingChar}/")]
        public string GetSurroundingWords(string markName, string type, string rangeStart, string rangeEnd,
            string preceedingChar, string succeedingChar)
        {
            if (!IsValidIdentifier(type))
            {
                return "Error: invalid type.";
            }

            var neo4jQuery =
                $"MATCH (a:{type})-[:Mark]->(m:MARK) WHERE m.name CONTAINS $markName " +
                "MATCH (a)-[:Mark]->(n:MARK) " +
                "RETURN n.creationTime, n.name, ID(n), labels(n)";

            var statementResultSet = _driver.Session().Run(neo4jQuery, new { markName });
            var listOfJsonObjects = CreateListOfJsonNodeObjects(statementResultSet);

            return listOfJsonObjects;
        }

        [HttpPost("[action]")]
        public string FindNode()
        {
            var form = Request.Form;
            var search = form["search"].ToString();

            var neo4jQuery = "";
            if (search == "spørgsmål")
            {
                neo4jQuery =
                $"MATCH(m:ROOT)-->(:MARK)-->(n:SPEC) WHERE n.name=$search RETURN m AS node, rand() as r " +
                 "ORDER BY r LIMIT 1";
            } 
            else if (int.TryParse(search, out int nodeid))
            {
                neo4jQuery = $"MATCH(n) WHERE ID(n)={nodeid} RETURN n AS node";
            }
            else
            {
                //Hvis det er tekst (bruges til løbende søgning)
                neo4jQuery =
                //Find en MARK som har minimum det indhold som er skrevet indtil nu: "v" finder alle MARK-noder med "v" i, mens "vinden fra nordjylland" finder en MARK med hele den sætning i (og den slags MARK er sjældne)
                //$"MATCH (mark:MARK)<-[:Mark]-(m) WHERE  toLower(mark.name) CONTAINS toLower('{search}') WITH mark AS soegeresultat, m AS relevant  RETURN relevant LIMIT 1 ";

                //Find en SPEC/ROOT som har en række ASS knyttet til sig, hvor - hvis man lægger alle ASS.name sammen "jeg"+"har"+"pest" så skal SPEC/ROOT spyttes ud 
                //$"MATCH (n:ASS)-[r:Ass]-(m) WHERE toLower('{search}') CONTAINS toLower(n.name) WITH n AS ord, m AS relevante, r AS forbindelser MATCH (relevante)-[forbindelser]-(ord)--() RETURN relevante, count(forbindelser) AS antal ORDER BY antal DESC LIMIT 1";

                //Find en ASS som optræder i det skrevne, og spyt den associerede node ud, som oftest vil være en SPEC eller en ROOT
                "MATCH (ass:ASS)-[:Ass]-(m) WHERE  toLower($search) " +
                $"CONTAINS toLower(' ' + ass.name + ' ') " +
                $"WITH ass AS soegeresultat, " +
                $"m AS relevant, " +
                $"rand() as r " +
                $"RETURN relevant " +                
                //$"count(soegeresultat) as r " +
                $"ORDER BY r DESC LIMIT 1  ";


            }

            var statementResultSet = _driver.Session().Run(neo4jQuery, new { search });
            var listOfJsonObjects = CreateListOfJsonNodeObjects(statementResultSet);

            return listOfJsonObjects;
        }

        [HttpPost("[action]")]
        public string MergeMarkNodes()
        {
            var form = Request.Form;
            var name = form["name"].ToString();
            var type = form["type"].ToString();
            var rangeStart = form["rangeStart"].ToString();
            var rangeEnd = form["rangeEnd"].ToString();
            var parentId = form["parentId"].ToString();

            if (!IsValidIdentifier(type) || !int.TryParse(parentId, out var parent)
                || !int.TryParse(rangeStart, out var start) || !int.TryParse(rangeEnd, out var end))
            {
                return "Error: invalid type, parentId or range.";
            }

            var mergeMarkNodesQuery = $"MATCH (m:{type})<-[:Mark]-(n) WHERE ID(n)=$parentId AND m.name = $name " +
                                      "MATCH (m) WHERE NOT EXISTS(m.range) OR m.range = [$rangeStart, $rangeEnd] " +
                                      "WITH m ORDER BY m.creationTime DESC " +
                                      "WITH collect(m) AS marks " +
                                      "CALL apoc.refactor.mergeNodes(marks, { properties: 'override',  mergeRels:true}) YIELD node " +
                                      "RETURN node";

            var statementResultSet = _driver.Session().Run(mergeMarkNodesQuery,
                new { name, parentId = parent, rangeStart = start, rangeEnd = end });
            var listOfJsonObjects = CreateListOfJsonNodeObjects(statementResultSet);

            return listOfJsonObjects;
        }


        [HttpPost("[action]")]
        public string Delete()
        {
            var form = Request.Form;
            var scope = form["scope"].ToString();
            int nodeId = 0;
            bool result = int.TryParse(scope, out nodeId);

            var neo4jQuery = "";

            if (scope.ToLower() == "all")
            {
                if (!_environment.IsDevelopment())
                {
                    return "Error: scope=all is only allowed in Development.";
                }
                neo4jQuery = "MATCH(n) DETACH DELETE n";
            }
            if (nodeId > 0)
            {
                neo4jQuery =
               $"MATCH(n) WHERE ID(n)={nodeId} " +
                "DETACH DELETE(n)";
            }
            if (neo4jQuery == "")
            {
                return "Error: scope must be a node id or 'all'.";
            }
            var statementResultSet = _driver.Session().Run(neo4jQuery);
            var listOfJsonObjects = CreateListOfJsonNodeObjects(statementResultSet);

            return listOfJsonObjects;
        }

        [HttpGet("[action]/{specID}")]
        public string ChooseOutputNode(int specID)
        {


            var nearestSPEC =
                "MATCH(denne) " +
                $"WHERE ID(denne)={specID} " +
                $"WITH denne " +
                "MATCH(denne)-->(:ASS)<--(nearestSPEC:SPEC) " +
                "RETURN nearestSPEC AS node";


            var neo4jQuery = nearestSPEC;

            var statementResultSet = _driver.Session().Run(neo4jQuery);

            var listOfJsonObjects = CreateListOfJsonNodeObjects(statementResultSet);

            return listOfJsonObjects;
        }

        [HttpGet("[action]")]
        public string GetHistory()
        {
            var neo4jQuery =
                $"MATCH (n) WHERE NOT (n:ASS) WITH n ORDER BY n.creationTime DESC LIMIT 100 RETURN n";

            var statementResultSet = _driver.Session().Run(neo4jQuery);
            var listOfJsonObjects = CreateListOfJsonNodeObjects(statementResultSet);

            return listOfJsonObjects;
        }

        private static readonly Regex IdentifierPattern = new Regex("^[A-Za-z_][A-Za-z0-9_]*$");

        // Labels and relationship types cannot be Cypher parameters, so they are whitelisted by pattern instead.
        private static bool IsValidIdentifier(string value) => value != null && IdentifierPattern.IsMatch(value);

        private string CreateListOfJsonNodeObjects(IResult statementResultSet)
        {
            var listOfNodes = new List<Node>();

            if (statementResultSet.Keys.Count > 0)
            {
                foreach (IRecord stmntResult in statementResultSet)
                {
                    var nodeResult = stmntResult[0].As<INode>();
                    Node node;
                    if (nodeResult.Labels[0].ToUpper() == "MARK")
                    {
                        var rangeList = nodeResult["range"].As<List<int>>();
                        node = new MarkNode
                        {
                            CreationTime = nodeResult["creationTime"].As<string>(),
                            NodeName = nodeResult["name"].As<string>(),
                            NodeId = nodeResult.Id.ToString(),
                            NodeLabel = nodeResult.Labels[0].As<string>(),
                            RangeStart = rangeList[0],
                            RangeEnd = rangeList[1]
                        };

                    }
                    else
                    {
                        node = new Models.Node
                        {
                            CreationTime = nodeResult["creationTime"].As<string>(),
                            NodeName = nodeResult["name"].As<string>(),
                            NodeId = nodeResult.Id.ToString(),
                            NodeLabel = nodeResult.Labels[0].As<string>(),
                        };
                    }

                    listOfNodes.Add(node);
                }
            }
            else
            {
                var node = new Node
                {
                    CreationTime = "<|no creation time|>",
                    NodeName = "<|no results|>",
                    NodeId = "<|no id|>",
                    NodeLabel = "<|no label|>"
                };
                listOfNodes.Add(node);
            }

            var jsonListOfNodes = JsonConvert.SerializeObject(listOfNodes, Formatting.Indented);
            return jsonListOfNodes;
        }

        private string CreateListOfJsonNodeObjectsInPairs(IResult statementResultSet)
        {
            var listOfNodesPairs = new List<Tuple<Node, Node>>();
            if (statementResultSet.Keys.Count > 0)
            {
                foreach (IRecord stmntResult in statementResultSet)
                {

                    var fromNodeResult = stmntResult[0].As<INode>();

                    var fromNode = new Node
                    {
                        CreationTime = fromNodeResult["creationTime"].As<string>(),
                        NodeName = fromNodeResult["name"].As<string>(),
                        NodeId = fromNodeResult.Id.ToString(),
                        NodeLabel = fromNodeResult.Labels[0].As<string>()
                    };

                    var toNodeResult = stmntResult[1].As<INode>();

                    var toNode = new Node
                    {
                        CreationTime = toNodeResult["creationTime"].As<string>(),
                        NodeName = toNodeResult["name"].As<string>(),
                        NodeId = toNodeResult.Id.ToString(),
                        NodeLabel = toNodeResult.Labels[0].As<string>()
                    };
                    var nodePair = Tuple.Create(fromNode, toNode);
                    listOfNodesPairs.Add(nodePair);
                }
            }
            else
            {
                var fromNode = new Node
                {
                    CreationTime = "<|no creation time|>",
                    NodeName = "<|no results|>",
                    NodeId = "<|no id|>",
                    NodeLabel = "<|no label|>"
                };
                var toNode = new Node
                {
                    CreationTime = "<|no creation time|>",
                    NodeName = "<|no results|>",
                    NodeId = "<|no id|>",
                    NodeLabel = "<|no label|>"
                };
                var nodePair = Tuple.Create(fromNode, toNode);
                listOfNodesPairs.Add(nodePair);
            }

            var jsonListOfNodes = JsonConvert.SerializeObject(listOfNodesPairs, Formatting.Indented);
            return jsonListOfNodes;
        }

        private void Dispose()
        {
            _driver?.Dispose();
        }
    }
}