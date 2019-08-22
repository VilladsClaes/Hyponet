import javafx.beans.property.SimpleStringProperty;


public class HistoryNode {
    private final SimpleStringProperty _timestamp;
    private final SimpleStringProperty _name;
    private final SimpleStringProperty _nodeType;
    private final SimpleStringProperty _id;



    public HistoryNode(String timeStamp, String id, String name, String nodeType){
        _timestamp = new SimpleStringProperty(timeStamp);
        _id = new SimpleStringProperty(id);
        _name = new SimpleStringProperty(name);
        _nodeType = new SimpleStringProperty(nodeType);
    }

    public String getTimestamp() {
        return _timestamp.get();
    }
    public void setTimestamp(String timestamp) {
        _timestamp.set(timestamp);
    }

    public String getId(){
        return _id.get();
    }

    public void setId(String id){
        _id.set(id);
    }

    public String getName(){
        return _name.get();
    }

    public void setName(String name){
        _name.set(name);
    }

    public String getNodeType(){
        return _nodeType.get();
    }

    public void setNodeType(String nodeType){
        _nodeType.set(nodeType);
    }
}
