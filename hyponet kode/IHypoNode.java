import org.neo4j.driver.v1.Value;

import java.util.ArrayList;
import java.util.List;

public interface IHypoNode {
    void addTimestamp(long timestamp);
    void addId(int id);
    void addName(String name);
    void addNodeTypes(List<Object> nodeType);
    long getTimeStamp();
    long getId();
    String getName();
    ArrayList<String> getNodeType();
}
