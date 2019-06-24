import org.neo4j.driver.v1.*;
import java.util.ArrayList;
import java.util.Iterator;
import org.neo4j.driver.v1.Value;
import java.sql.*;
import java.sql.SQLException;
import java.time.DateTimeException;
import java.util.ArrayList;
import javafx.application.Application;
import javafx.collections.FXCollections;
import javafx.collections.ObservableList;
import javafx.scene.Scene;
import javafx.scene.control.cell.PropertyValueFactory;
import javafx.scene.layout.Border;
import javafx.scene.layout.BorderPane;
import javafx.scene.layout.VBox;
import javafx.stage.Stage;
import javafx.geometry.*;
import javafx.scene.control.TextField;
import javafx.scene.control.*;
import javafx.scene.input.*;
import javafx.event.*;
import java.sql.Timestamp;
import java.util.ArrayList;
import org.neo4j.driver.v1.Value;
import java.util.ArrayList;
import java.util.List;
import org.neo4j.driver.v1.Value;
import java.util.ArrayList;
import java.util.List;

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

public class SqlConnection {

    private Connection _connection;

    public SqlConnection(String url) {
        _connection = getConnection(url);
    }

    public Connection getConnection(String url) {

        Connection conn = null;

        try {
            conn = DriverManager.getConnection(url);

        } catch (SQLException ex) {
            // handle any errors
            System.out.println("SQLException: " + ex.getMessage());
            System.out.println("SQLState: " + ex.getSQLState());
            System.out.println("VendorError: " + ex.getErrorCode());
        }

        return conn;
    }


    public void insertIntoSqlHistoryTable(Timestamp timestamp, String name, String type, long nodeId){
        Statement statement = null;
        try {
            statement = _connection.createStatement();
            statement.execute("INSERT INTO History (timestamp, name, type, nodeId) VALUES ('" + timestamp + "', ' " + name + "', '" + type + "', '" + nodeId+ "')");
        }
        catch(Exception e){
            e.printStackTrace();
        }
    }

    public void deleteHistoryTable(){
        Statement statement = null;
        try {
            statement = _connection.createStatement();
            statement.execute("DELETE FROM History");
        }
        catch(Exception e){
            e.printStackTrace();
        }
    }

    public ArrayList<HistoryNode> getFromSqlHistoryTable() {
        Statement stmt = null;
        ResultSet resultSet = null;
        //ArrayList<String> listOfResultsFromSQL = new ArrayList<>();
        ArrayList<HistoryNode> listOfResultsFromSQL = new ArrayList<>();
        try {
            stmt = _connection.createStatement();
            resultSet = stmt.executeQuery("SELECT * FROM History ORDER BY timestamp ASC");
            while (resultSet.next()) {

                String timestamp = resultSet.getString("timestamp");
                String name = resultSet.getString("name");
                String type = resultSet.getString("type");
                String nodeId = resultSet.getString("nodeId");
                /*String singleResult = "Timestamp: " + timestamp + ", Name: " + name
                        + ", Type: " + type + ", NodeId: " + nodeId + "\n";*/

                HistoryNode historyNode = new HistoryNode(timestamp, nodeId, name, type);
                listOfResultsFromSQL.add(historyNode);
                //listOfResultsFromSQL.add(singleResult);


            }
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            try {
                if (resultSet != null) resultSet.close();
            } catch (SQLException e) {
                e.printStackTrace();
            }
            try {
                if (stmt != null) stmt.close();
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }
        return listOfResultsFromSQL;
    }

    public Connection getSqlConnection(){
        return _connection;
    }
}

public class NeoDbConnection {

    private Session session;
    private Driver driver;


    public NeoDbConnection(String uri){
        initializeDbSession(uri);
    }

    private void initializeDbSession(String uri){
        try {
            driver = GraphDatabase.driver(uri);
            session = driver.session();
        }
        catch(Exception e){
            System.out.println("Error! Neo4j-server not running / Can't connect to Neo4j-server");
        }
    }

    public IHypoNode createRootNode(String userInput){
        String statementString = "CREATE (n:Root {name:'" + userInput + "'}) SET n.creationTime = timestamp() RETURN n.creationTime, n.name, ID(n), labels(n)";
        Statement createRootStatement = new Statement(statementString);
        IHypoNode hypoNode = processStatement(createRootStatement);
        return hypoNode;
    }

    public IHypoNode createSelectionNode(String selection){
        String statementString = "CREATE (n:Selection {name:'" + selection.trim() + "'}) SET n.creationTime = timestamp() RETURN n.creationTime, n.name, ID(n), labels(n)";
        Statement createSelectionStatement = new Statement(statementString);
        IHypoNode hypoNode = processStatement(createSelectionStatement);
        return hypoNode;
    }

    public IHypoNode createSpecificationNode(String specification ){
        String statementString = "CREATE (n:Specification {name:'" + specification + "'}) SET n.creationTime = timestamp() RETURN n.creationTime, n.name, ID(n), labels(n)";
        Statement createSpecificationStatement = new Statement(statementString);
        IHypoNode hypoNode = processStatement(createSpecificationStatement);
        return hypoNode;
    }

    public IHypoNode createAssociationNode(String association){
        String statementString = "CREATE (n:Association {name:'" + association + "'}) SET n.creationTime = timestamp() RETURN n.creationTime, n.name, ID(n), labels(n) ";

                String oldStatementNOTFORASSOCIATION = "MATCH (mark:Selection {name: '"+ association +"', creationTime: '+ cTime +'}) " +
                "MATCH (p_mark)-[:MARK_RELATION]->(mark) WHERE (p_mark:Root OR p_mark:Specification) " +
                "MATCH (n) WHERE (n:Specification OR n:Root OR n:Selection) "+
                "AND NOT (n)-[:MARK_RELATION]->(mark) "+
                "AND NOT (n)-[:ASS_RELATION]->(:Association{name: mark.name})<-[:ASS_RELATION]-(mark) "+
                "AND NOT (n.name = mark.name) "+
                "AND n.creationTime < mark.creationTime "+
                "AND (n)-[:MARK_RELATION|SPEC_RELATION|ASS_RELATION*]->(mark) " +
                "AND n.name CONTAINS mark.name "+
                "WITH n, mark " +
                "CREATE (mark)-[r:ASS_RELATION]->(a:Association {name: mark.name})<-[r2:ASS_RELATION]-(n)";

        Statement createAssociationStatement = new Statement(statementString);
        IHypoNode associationNode = processStatement(createAssociationStatement);
        return associationNode;
    }

    //HØJ KOBLING!! Denne metode skal nok refaktoreres. Lad den returnere de fundne noder, og derefter kan en anden metode lave relationen.
    // OBS: Der er muligvis et underliggende problem i måden process-statement og handleresult er lavet på. De kan ikke nødvendigvis håndtere lister af noder.

    public void findAllMatchingSpecOrRootNodes(IHypoNode markNode, String nodeName){

        String statementString =
                "MATCH (m:Selection) WHERE ID(m) = " + markNode.getId()+" "+
                "MATCH (n) WHERE (n:Specification OR n:Root) AND (LOWER(n.name) CONTAINS LOWER('" + nodeName +
                        "')) AND NOT (n)-[:MARK]->(m)" +
                        "RETURN  n.name, n.creationTime, ID(n) AS id, labels(n) AS type";

        Statement findAllMatchingSpecOrRootNodesStatement = new Statement(statementString);
        StatementResult statementResult = executeStatement(findAllMatchingSpecOrRootNodesStatement);
        ArrayList<IHypoNode> listOfHypoNodes = new ArrayList<IHypoNode>() ;

        boolean foundMatches = statementResult.hasNext();
        while(statementResult.hasNext()){
            IHypoNode hypoNode;
            Record record= statementResult.next();
            long timestamp = record.get("n.creationTime").asLong();
            int id = record.get("id").asInt();
            String name = record.get("n.name").asString();

            Iterable<Value> typeList = record.get("type").values();
            Iterator<Value> recordIterator = typeList.iterator();
            ArrayList<String> labelList = new ArrayList<String>();

            while(recordIterator.hasNext()) {
                Value obj = recordIterator.next();
                labelList.add(obj.asString());
                System.out.println("labelType: " + obj);
            }

            hypoNode = new HypoNode(timestamp, id, name, labelList);
            listOfHypoNodes.add(hypoNode);
        }

        if(foundMatches) {
            IHypoNode associationNode = createAssociationNode(markNode.getName());
                createRelationBetweenTwoNodes(markNode, associationNode, "ASS");


            for (IHypoNode node : listOfHypoNodes) {
                createRelationBetweenTwoNodes(associationNode, node, "ASS");
            }
        }


    }

    public IHypoNode getNodeToEditFrom(HistoryNode historyNode){
        String statementString = "MATCH (n) WHERE ID(n) = " + Integer.parseInt(historyNode.getId()) + " RETURN n.creationTime, n.name, ID(n), labels(n)";
        Statement createRelationBetweenTwoNodesStatement = new Statement(statementString);
        IHypoNode hypoNode = processStatement(createRelationBetweenTwoNodesStatement);
        return hypoNode;
    }
    public void createRelationBetweenTwoNodes(IHypoNode fromNode, IHypoNode toNode, String relationType){
       String statementString = "MATCH (n:" + fromNode.getNodeType().get(0) + " {creationTime:" + fromNode.getTimeStamp() + ", name:\"" + fromNode.getName() +
                "\"}) MATCH (l:"+toNode.getNodeType().get(0)+
                " {creationTime:" + toNode.getTimeStamp() + ", name:\"" + toNode.getName() + "\"}) CREATE (n)-[:"+relationType+"]->(l)";
        Statement createRelationBetweenTwoNodesStatement = new Statement(statementString);
        processStatement(createRelationBetweenTwoNodesStatement);
    }

    public ArrayList<IHypoNode> findConnectedAssociations(IHypoNode fromNode){
        String statementString = "MATCH (n:Selection {creationTime: " + fromNode.getTimeStamp() + "})-[:ASS*]->(m) WHERE NOT (n:Selection {creationTime: " + fromNode.getTimeStamp() + "})-[:ASS*1]->(m) RETURN  m.name, m.creationTime, ID(m) AS id, labels(m) AS type";
        Statement findAssociationsStatement = new Statement(statementString);
        StatementResult statementResult = executeStatement(findAssociationsStatement);

        ArrayList<IHypoNode> listOfHypoNodes = new ArrayList<IHypoNode>() ;


        while(statementResult.hasNext()){
            IHypoNode hypoNode;
            Record record= statementResult.next();
            long timestamp = record.get("m.creationTime").asLong();
            int id = record.get("id").asInt();
            String name = record.get("m.name").asString();

            Iterable<Value> typeList = record.get("type").values();
            Iterator<Value> recordIterator = typeList.iterator();
            ArrayList<String> labelList = new ArrayList<String>();

            while(recordIterator.hasNext()) {
                Value obj = recordIterator.next();
                labelList.add(obj.asString());
            }

            hypoNode = new HypoNode(timestamp, id, name, labelList);
            listOfHypoNodes.add(hypoNode);
        }
        return listOfHypoNodes;
    }

    public void deleteAllFromDatabase(){
        String statementString = "MATCH (n) DETACH DELETE n";
        Statement deleteAllStatement = new Statement(statementString);
        processStatement(deleteAllStatement);
    }

    public IHypoNode processStatement(Statement statement){

        StatementResult statementResult = executeStatement(statement);
        IHypoNode nodeObject = handleResult(statementResult);
        return nodeObject;

    }

    private StatementResult executeStatement(Statement statement){
        StatementResult statementResult = session.run(statement);
        return statementResult;
    }

    private IHypoNode handleResult(StatementResult statementResult){
        while(statementResult.hasNext()){
            Record record = statementResult.next();
            IHypoNode hypoNode = new HypoNode();
            hypoNode.addTimestamp(record.get(0).asLong());
            hypoNode.addName(record.get(1).asString());
            hypoNode.addId(record.get(2).asInt());
            hypoNode.addNodeTypes(record.get(3).asList());
            return hypoNode;

        }
        return new HypoNode();
    }
}


public class Main extends Application {

    public SqlConnection sqlDb;
    public IHypoNode fromNode;
    public IHypoNode toNode;
    private boolean _isDragged = false;
    private boolean _hasBeenAddedAsInput = false;
    private boolean _hasBeenSelected = false;
    private Scene _scene;
    private TextField _inputTextField;
    private TextField _specificationTextField;
    private TextArea _historyTextArea;
    private TextArea _outputTextArea;
    private NeoDbConnection _neoDb;
    private Button _inputButton;
    private Button _deleteAllFromNeo4j;
    private Button _deleteAllFromHistoryDatabase;
    private boolean _controlPressed;
    private ArrayList<IHypoNode> _listOfHypoNodes = new ArrayList();
    private TableView _historyTable = new TableView();
    private final ObservableList<HistoryNode> _historyData = FXCollections.observableArrayList();

    public static void main(String[] args) {
        launch(args);
    }

    @Override
    public void start(Stage primaryStage) {
        primaryStage.setTitle("Hyponet");

        try {
            _neoDb = new NeoDbConnection("bolt://localhost:7687");
            sqlDb = new SqlConnection("jdbc:mysql://188.166.67.46/hyponet?" +
                    "user=jewsef&password=dit6OsVbgK8k");
            System.out.println("SqlDbConnection: " + sqlDb.getSqlConnection().toString());
        } catch (Exception e) {
            System.out.println("Main.start() - " + e.getMessage());
        }

        BorderPane border = initializeGridPane();
        _scene = new Scene(border, 1000, 700);
        initializeEventHandlers();

        primaryStage.setScene(_scene);
        primaryStage.show();
    }

    private BorderPane initializeGridPane() {
        BorderPane borderPane = new BorderPane();
        BorderPane innerBorderPane = new BorderPane();
        BorderPane topBorderPane = new BorderPane();
        VBox rightVBox = new VBox();

        borderPane.setPadding(new Insets(25, 25, 25, 25));
        innerBorderPane.setPadding(new Insets(70, 5, 5, 5));
        topBorderPane.setPadding(new Insets(5, 5, 5, 5));

        _inputTextField = new TextField();
        _specificationTextField = new TextField();
        _specificationTextField.setMaxWidth(500);
        _specificationTextField.setDisable(true);
        _specificationTextField.setVisible(false);

        _historyTextArea = new TextArea();
        _outputTextArea = new TextArea();
        _inputButton = new Button();
        _inputButton.setText("Ny Rodnode");
        borderPane.setCenter(innerBorderPane);
        borderPane.setTop(topBorderPane);
        innerBorderPane.setCenter(_inputTextField);
        innerBorderPane.setTop(_specificationTextField);
        innerBorderPane.setRight(_inputButton);


        _historyTable.setEditable(true);
        TableColumn timestampColumn = new TableColumn("Timestamp");
        timestampColumn.setResizable(true);
        TableColumn nameColumn = new TableColumn("Name");
        TableColumn typeColumn = new TableColumn("Type");
        TableColumn nodeIdColumn = new TableColumn("Node ID");

        timestampColumn.setCellValueFactory(
                new PropertyValueFactory<HistoryNode,String>("timestamp")
        );
        nameColumn.setCellValueFactory(
                new PropertyValueFactory<HistoryNode,String>("name")
        );
        typeColumn.setCellValueFactory(
                new PropertyValueFactory<HistoryNode,String>("nodeType")
        );
        nodeIdColumn.setCellValueFactory(
                new PropertyValueFactory<HistoryNode,String>("id")
        );

        _historyTable.setItems(_historyData);
        _historyTable.getColumns().addAll(timestampColumn, nameColumn, typeColumn, nodeIdColumn);
        _historyTable.autosize();

        _deleteAllFromHistoryDatabase = new Button();
        _deleteAllFromHistoryDatabase.setText("Slet Historik");
        _deleteAllFromNeo4j = new Button();
        _deleteAllFromNeo4j.setText("Slet Neo4j");

        topBorderPane.setCenter(_historyTable);
        topBorderPane.setRight(rightVBox);
        rightVBox.getChildren().addAll(_deleteAllFromNeo4j, _deleteAllFromHistoryDatabase);

        borderPane.setBottom(_outputTextArea);
        BorderPane.setAlignment(_deleteAllFromNeo4j, Pos.BOTTOM_LEFT);
        BorderPane.setAlignment(_deleteAllFromHistoryDatabase, Pos.BOTTOM_RIGHT);
        BorderPane.setAlignment(_inputTextField, Pos.CENTER);
        BorderPane.setAlignment(_inputButton, Pos.CENTER_RIGHT);
        return borderPane;
    }

    /*public String getSelectedText(TextField textField){
       String text = textField.getSelectedText();
       return text;
    }*/
    /*public Connection getSqlConnection(){

    }
*/

    private void initializeEventHandlers() {
        EventHandler<MouseEvent> dragEvent = (e) -> {
            _isDragged = true;
        };

        EventHandler<MouseEvent> releaseEvent = (e) -> {
            if (_isDragged) {
                String textSelectionUntrimmed = _inputTextField.getSelectedText();
                String textSelection = textSelectionUntrimmed.trim();
                _isDragged = false;
                if (_hasBeenAddedAsInput && !textSelection.isEmpty()) {
                    IHypoNode hypoNode = _neoDb.createSelectionNode(textSelection);
                    toNode = hypoNode;
                    _neoDb.createRelationBetweenTwoNodes(fromNode, toNode, "MARK");
                    fromNode = hypoNode;
                    _neoDb.findAllMatchingSpecOrRootNodes(hypoNode, hypoNode.getName());
                    ArrayList<IHypoNode> listOfHypoNodes = _neoDb.findConnectedAssociations(fromNode);
                    _outputTextArea.clear();
                    for(IHypoNode node : listOfHypoNodes) {

                        _outputTextArea.appendText(node.getName() + " - ID: " + node.getId() + "\n");
                    }
                    _specificationTextField.setDisable(false);
                    _specificationTextField.setVisible(true);
                    _hasBeenAddedAsInput = false;
                }
            }
        };

        EventHandler<MouseEvent> clickEvent = (e) -> {
            System.out.println("Mousebutton clicked");
        };

        _inputButton.setOnAction((e) -> {
            _hasBeenAddedAsInput = true;
            String inputText = _inputTextField.getText();
            IHypoNode hypoNode = _neoDb.createRootNode(inputText);
            sqlDb.insertIntoSqlHistoryTable(new Timestamp(hypoNode.getTimeStamp()), hypoNode.getName(), hypoNode.getNodeType().get(0), hypoNode.getId()); //SQL command Insert into SQL DB
            fromNode = hypoNode;
            _historyTextArea.clear();
            getLatestHistoryFromSql();
        });

        _deleteAllFromHistoryDatabase.setOnAction((e) -> {
            sqlDb.deleteHistoryTable();
            _historyTextArea.clear();
            getLatestHistoryFromSql();
        });

        _deleteAllFromNeo4j.setOnAction((e) -> {
            _neoDb.deleteAllFromDatabase();
            _historyTextArea.clear();
            getLatestHistoryFromSql();
        });

        _specificationTextField.setOnKeyPressed((event) -> {
            if (event.getCode() == KeyCode.ENTER) {
                String allText = _specificationTextField.getText();
                IHypoNode hypoNode = _neoDb.createSpecificationNode(allText);
                sqlDb.insertIntoSqlHistoryTable(new Timestamp(hypoNode.getTimeStamp()), hypoNode.getName(), hypoNode.getNodeType().get(0), hypoNode.getId()); //SQL command Insert into SQL DB
                toNode = hypoNode;
                _neoDb.createRelationBetweenTwoNodes(fromNode, toNode, "SPEC");
                fromNode = hypoNode;
                _historyTextArea.clear();

                getLatestHistoryFromSql();

                _inputTextField.setText(allText);
                _specificationTextField.clear();
                _specificationTextField.setDisable(true);
                _specificationTextField.setVisible(false);
                _hasBeenAddedAsInput = true;
            }
        });

        _inputTextField.addEventFilter(MouseEvent.MOUSE_DRAGGED, dragEvent);
        _inputTextField.addEventFilter(MouseEvent.MOUSE_CLICKED, clickEvent);
        _inputTextField.addEventFilter(MouseEvent.MOUSE_RELEASED, releaseEvent);

        _historyTable.setRowFactory( tv -> {
            TableRow<HistoryNode> row = new TableRow<>();
            row.setOnMouseClicked(event -> {
                if (event.getClickCount() == 2 && (! row.isEmpty()) ) {
                    HistoryNode rowData = row.getItem();
                    _inputTextField.setText(rowData.getName());
                    fromNode = _neoDb.getNodeToEditFrom(rowData);
                }
            });
           return row;
        });
    }

    public void getLatestHistoryFromSql(){
        _historyData.clear();
        for(HistoryNode historyNode : sqlDb.getFromSqlHistoryTable()){
            _historyData.add(historyNode);
        }
    }
}