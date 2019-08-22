import org.neo4j.driver.v1.Value;

import java.util.ArrayList;
import java.util.List;

public class HypoNode implements IHypoNode  {
    private long _timestamp;
    private long _id;
    private String _name;
    private ArrayList<String> _nodeType;

    public HypoNode(){
        _nodeType = new ArrayList<>();
    }

    public HypoNode(long timeStamp, long id, String name, ArrayList<String> nodeType){
        _timestamp = timeStamp;
        _id = id;
        _name = name;
        _nodeType = nodeType;
    }

    public void addTimestamp(long timestamp){
        _timestamp = timestamp;
    }

    public void addId(int id){
        _id = id;
    }

    public void addName(String name){
        _name = name;
    }

    public void addNodeTypes(List<Object> listOfNodeTypes){
            for(Object nodeType : listOfNodeTypes){
                String nodeTypeAsString = (String) nodeType;

                _nodeType.add(nodeTypeAsString);
            }
    }


    public long getTimeStamp(){
        return _timestamp;
    }

    public long getId(){
        return _id;
    }

    public String getName(){
        return _name;
    }

    public ArrayList<String> getNodeType(){
        return _nodeType;
    }










}
