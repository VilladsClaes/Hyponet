import java.sql.*;
import java.sql.SQLException;
import java.time.DateTimeException;
import java.util.ArrayList;


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


