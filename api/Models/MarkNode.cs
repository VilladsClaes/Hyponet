using Newtonsoft.Json;

namespace hyponet_api.Models
{
    public class MarkNode : Node
    {
        [JsonProperty("rangeStart")]
        public int RangeStart { get; set; }

        [JsonProperty("rangeEnd")]
        public int RangeEnd { get; set; }
    }
}
