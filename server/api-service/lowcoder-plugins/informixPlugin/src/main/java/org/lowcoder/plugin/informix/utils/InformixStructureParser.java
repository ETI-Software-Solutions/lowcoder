package org.lowcoder.plugin.informix.utils;

import org.lowcoder.sdk.models.DatasourceStructure;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

@SuppressWarnings({ "SqlDialectInspection", "SqlNoDataSourceInspection" })
public class InformixStructureParser {

    public static final String DATE_COLUMN_TYPE_NAME = "date";
    public static final String DATETIME_COLUMN_TYPE_NAME = "datetime";
    public static final String TIMESTAMP_COLUMN_TYPE_NAME = "timestamp";

    /**
     * Example output for COLUMNS_QUERY:
     * +------------+-----------+-------------+-------------+-------------+------------+----------------+
     * | table_name | column_id | column_name | column_type | is_nullable | COLUMN_KEY | EXTRA |
     * +------------+-----------+-------------+-------------+-------------+------------+----------------+
     * | test | 1 | id | int | 0 | PRI | auto_increment |
     * | test | 2 | firstname | varchar | 1 | | |
     * | test | 3 | middlename | varchar | 1 | | |
     * | test | 4 | lastname | varchar | 1 | | |
     * +------------+-----------+-------------+-------------+-------------+------------+----------------+
     */
    public static final String COLUMNS_QUERY = """
            SELECT tab.tabname AS table_name,
            	col.colno AS column_id,
            	col.colname AS column_name,
            	CASE
            	WHEN (col.coltype = 0 OR col.coltype = 256) THEN 'CHAR'
            	WHEN (col.coltype = 1 OR col.coltype = 257) THEN 'SMALLINT'
            	WHEN (col.coltype = 2 OR col.coltype = 258) THEN 'INTEGER'
            	WHEN (col.coltype = 3 OR col.coltype = 259) THEN 'FLOAT'
            	WHEN (col.coltype = 4 OR col.coltype = 260) THEN 'SMALLFLOAT'
            	WHEN (col.coltype = 5 OR col.coltype = 261) THEN 'DECIMAL'
            	WHEN (col.coltype = 6 OR col.coltype = 262) THEN 'SERIAL'
            	WHEN (col.coltype = 7 OR col.coltype = 263) THEN 'DATE'
            	WHEN (col.coltype = 8 OR col.coltype = 264) THEN 'MONEY'
            	WHEN (col.coltype = 10 OR col.coltype = 266) THEN 'DATETIME'\s
            	WHEN (col.coltype = 11 OR col.coltype = 267) THEN 'BYTE'
            	WHEN (col.coltype = 12 OR col.coltype = 268) THEN 'TEXT'
            	WHEN (col.coltype = 13 OR col.coltype = 269) THEN 'VARCHAR'
            	WHEN (col.coltype = 14 OR col.coltype = 270) THEN 'INTERVAL'
            	WHEN (col.coltype = 15 OR col.coltype = 271) THEN 'NCHAR'
            	WHEN (col.coltype = 16 OR col.coltype = 272) THEN 'NVARCHAR'
            	WHEN (col.coltype = 17 OR col.coltype = 273) THEN 'INT8'
            	WHEN (col.coltype = 40 OR col.coltype = 296) THEN 'JSON'
            	WHEN (col.coltype = 41 OR col.coltype = 297) THEN 'BOOLEAN'
            	WHEN (col.coltype = 52 OR col.coltype = 308) THEN 'BIGINT'
            	ELSE 'UNKNOWN'
            	END AS column_type,
            	(CASE WHEN col.coltype > 255 THEN 1 ELSE 0 END) AS is_nullable,
            	CASE
            		WHEN col.colname IN
            		(
            			SELECT UNIQUE
            				(SELECT c.colname FROM syscolumns c WHERE c.tabid = i.tabid AND c.colno = i.part1)
            				FROM sysindexes i, systables t
            					WHERE i.tabid = t.tabid
            					AND t.tabname = tab.tabname
            					AND idxname IN
            			(
            				SELECT c.idxname AS pk_idx
            				FROM sysconstraints c, systables t,
            				OUTER (sysreferences r, systables t2, sysconstraints c2)
            				WHERE t.tabname = tab.tabname
            				AND t.tabid = c.tabid
            				AND r.constrid = c.constrid
            				AND t2.tabid = r.ptabid
            				AND c2.constrid = r.constrid
            				AND c.constrtype = 'P'
            			)
            			) THEN 'PRI'
            			WHEN col.colname IN
            			(
            			SELECT UNIQUE
            				(SELECT c.colname FROM syscolumns c WHERE c.tabid = i.tabid AND c.colno = i.part2)
            				FROM sysindexes i, systables t
            					WHERE i.tabid = t.tabid
            					AND t.tabname = tab.tabname
            					AND idxname IN
            			(
            				SELECT c.idxname AS pk_idx
            				FROM sysconstraints c, systables t,
            				OUTER (sysreferences r, systables t2, sysconstraints c2)
            				WHERE t.tabname = tab.tabname
            				AND t.tabid = c.tabid
            				AND r.constrid = c.constrid
            				AND t2.tabid = r.ptabid
            				AND c2.constrid = r.constrid
            				AND c.constrtype = 'P'
            			)
            			) THEN 'PRI'
            			WHEN col.colname IN
            			(
            			SELECT UNIQUE
            				(SELECT c.colname FROM syscolumns c WHERE c.tabid = i.tabid AND c.colno = i.part3)
            				FROM sysindexes i, systables t
            					WHERE i.tabid = t.tabid
            					AND t.tabname = tab.tabname
            					AND idxname IN
            			(
            				SELECT c.idxname AS pk_idx
            				FROM sysconstraints c, systables t,
            				OUTER (sysreferences r, systables t2, sysconstraints c2)
            				WHERE t.tabname = tab.tabname
            				AND t.tabid = c.tabid
            				AND r.constrid = c.constrid
            				AND t2.tabid = r.ptabid
            				AND c2.constrid = r.constrid
            				AND c.constrtype = 'P'
            			)
            			) THEN 'PRI'
            			ELSE ''
                END AS column_key,
                '' AS extra
            FROM systables tab
            JOIN syscolumns col ON tab.tabid = col.tabid
            WHERE tab.tabtype = 'T'  -- 'T' denotes base tables in Informix
            ORDER BY tab.tabname,
                     col.colno;
            """;

    /**
     * Example output for KEYS_QUERY:
     * +-----------------+-------------+------------+-----------------+-------------+----------------+---------------+----------------+
     * | CONSTRAINT_NAME | self_schema | self_table | constraint_type | self_column
     * | foreign_schema | foreign_table | foreign_column |
     * +-----------------+-------------+------------+-----------------+-------------+----------------+---------------+----------------+
     * | PRIMARY | mytestdb | test | p | id | NULL | NULL | NULL |
     * +-----------------+-------------+------------+-----------------+-------------+----------------+---------------+----------------+
     */
    public static final String KEYS_QUERY = """
            SELECT c.constrname AS constraint_name,
                   t.owner AS self_schema,
                   t.tabname AS self_table,
                   CASE
                       WHEN c.constrtype = 'R' THEN 'f'
                       WHEN c.constrtype = 'P' THEN 'p'
                       ELSE c.constrtype
                   END AS constraint_type,
                   col.colname AS self_column,
                   fk_tab.owner AS foreign_schema,
                   fk_tab.tabname AS foreign_table,
                   fk_col.colname AS foreign_column
            FROM sysconstraints c
            JOIN systables t ON c.tabid = t.tabid
            JOIN sysindexes i ON c.idxname = i.idxname
            JOIN syscolumns col ON col.tabid = t.tabid AND col.colno = i.part1
            LEFT JOIN sysreferences r ON c.constrid = r.constrid
            LEFT JOIN systables fk_tab ON r.ptabid = fk_tab.tabid
            LEFT JOIN syscolumns fk_col ON fk_col.tabid = fk_tab.tabid AND fk_col.colno = i.part1
            WHERE t.owner = USER
              AND (c.constrtype IN ('P', 'R'))
            ORDER BY t.tabname, c.constrname, col.colno;
            """;

    public static void parseTableKeys(Map<String, DatasourceStructure.Table> tablesByName, Statement statement)
            throws SQLException {
        try (ResultSet constraintsResultSet = statement.executeQuery(KEYS_QUERY)) {
            parseTableKeys(constraintsResultSet, tablesByName);
        }
    }

    private static void parseTableKeys(ResultSet constraintsResultSet,
            Map<String, DatasourceStructure.Table> tablesByName) throws SQLException {

        Map<String, DatasourceStructure.Key> keyRegistry = new HashMap<>();

        while (constraintsResultSet.next()) {
            final String constraintName = constraintsResultSet.getString("constraint_name");
            final char constraintType = constraintsResultSet.getString("constraint_type").charAt(0);
            final String selfSchema = constraintsResultSet.getString("self_schema");
            final String tableName = constraintsResultSet.getString("self_table");
            DatasourceStructure.Table table = tablesByName.get(tableName);
            if (table == null) {
                continue;
            }

            String keyFullName = tableName + "." + constraintsResultSet.getString("constraint_name");

            if (constraintType == 'p') {
                handlePrimaryKey(constraintsResultSet, table, keyRegistry, constraintName, keyFullName);
            }

            if (constraintType == 'f') {
                handleForeignKey(constraintsResultSet, table, keyRegistry, constraintName, selfSchema, keyFullName);

            }
        }
    }

    private static void handlePrimaryKey(ResultSet constraintsResultSet, DatasourceStructure.Table table,
            Map<String, DatasourceStructure.Key> keyRegistry, String constraintName,
            String keyFullName)
            throws SQLException {
        if (!keyRegistry.containsKey(keyFullName)) {
            DatasourceStructure.PrimaryKey key = new DatasourceStructure.PrimaryKey(constraintName, new ArrayList<>());
            keyRegistry.put(keyFullName, key);
            table.addKey(key);
        }
        ((DatasourceStructure.PrimaryKey) keyRegistry.get(keyFullName)).getColumnNames()
                .add(constraintsResultSet.getString("self_column"));
    }

    private static void handleForeignKey(ResultSet constraintsResultSet, DatasourceStructure.Table table,
            Map<String, DatasourceStructure.Key> keyRegistry, String constraintName,
            String selfSchema,
            String keyFullName) throws SQLException {
        String foreignSchema = constraintsResultSet.getString("foreign_schema");
        String prefix = (foreignSchema.equalsIgnoreCase(selfSchema) ? "" : foreignSchema + ".")
                + constraintsResultSet.getString("foreign_table")
                + ".";
        if (!keyRegistry.containsKey(keyFullName)) {
            DatasourceStructure.ForeignKey key = new DatasourceStructure.ForeignKey(
                    constraintName,
                    new ArrayList<>(),
                    new ArrayList<>());
            keyRegistry.put(keyFullName, key);
            table.addKey(key);
        }
        ((DatasourceStructure.ForeignKey) keyRegistry.get(keyFullName)).getFromColumns()
                .add(constraintsResultSet.getString("self_column"));
        ((DatasourceStructure.ForeignKey) keyRegistry.get(keyFullName)).getToColumns()
                .add(prefix + constraintsResultSet.getString("foreign_column"));
    }

    public static void parseTableAndColumns(Map<String, DatasourceStructure.Table> tablesByName, Statement statement)
            throws SQLException {
        try (ResultSet columnsResultSet = statement.executeQuery(COLUMNS_QUERY)) {
            while (columnsResultSet.next()) {
                String tableName = columnsResultSet.getString("table_name");
                String extra = columnsResultSet.getString("extra");

                DatasourceStructure.Table table = tablesByName.computeIfAbsent(tableName,
                        __ -> new DatasourceStructure.Table(
                                DatasourceStructure.TableType.TABLE, "", tableName,
                                new ArrayList<>(),
                                new ArrayList<>(),
                                new ArrayList<>()));

                table.addColumn(new DatasourceStructure.Column(
                        columnsResultSet.getString("column_name"),
                        columnsResultSet.getString("column_type"),
                        null,
                        extra.contains("DEFAULT_GENERATED") || extra.contains("auto_increment")));
            }
        }
    }
}
