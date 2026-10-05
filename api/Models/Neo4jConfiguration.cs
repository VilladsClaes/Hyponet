using hyponet_api.Interfaces;

namespace hyponet_api.Models
{
    public class Neo4jConfiguration : INeo4jDriverOptions
    {
        public string Uri { get; set; }
        public string User { get; set; }
        public string Password { get; set; }
    }
}
