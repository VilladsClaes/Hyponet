
import org.neo4j.driver.v1.*;
import java.util.ArrayList;
import java.util.Iterator;

import org.neo4j.driver.v1.Value;



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
