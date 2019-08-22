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
