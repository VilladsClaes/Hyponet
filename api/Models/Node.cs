using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;

namespace hyponet_api.Models
{
    public class Node
    {
        [JsonProperty("creationTime")]
        public string CreationTime { get; set; }

        [JsonProperty("nodeName")]
        public string NodeName { get; set; }

        [JsonProperty("nodeId")]
        public string NodeId { get; set; }

        [JsonProperty("nodeLabel")]
        public string NodeLabel { get; set; }

    }
}
