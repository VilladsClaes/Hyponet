namespace hyponet_api.Interfaces
{
    public interface INeo4jDriverOptions
    {
        string Uri { get; set; }
        string User { get; set; }
        string Password { get; set; }
    }
}
