package org.lowcoder.sdk.plugin.sqlcommand.command.informix;

import org.lowcoder.sdk.plugin.sqlcommand.changeset.BulkObjectChangeSet;
import org.lowcoder.sdk.plugin.sqlcommand.command.BulkUpdateCommand;

import java.util.Map;

import static org.lowcoder.sdk.plugin.sqlcommand.GuiSqlCommand.parseTable;
import static org.lowcoder.sdk.plugin.sqlcommand.changeset.BulkObjectChangeSet.parseBulkRecords;
import static org.lowcoder.sdk.plugin.sqlcommand.changeset.BulkObjectChangeSet.parsePrimaryKey;
import static org.lowcoder.sdk.plugin.sqlcommand.command.GuiConstants.INFORMIX_COLUMN_DELIMITER;

public class InformixBulkUpdateCommand extends BulkUpdateCommand {

    protected InformixBulkUpdateCommand(String table, BulkObjectChangeSet bulkObjectChangeSet,
                                        String primaryKey) {
        super(table, bulkObjectChangeSet, primaryKey, INFORMIX_COLUMN_DELIMITER, INFORMIX_COLUMN_DELIMITER);
    }

    public static InformixBulkUpdateCommand from(Map<String, Object> commandDetail) {
        String table = parseTable(commandDetail);
        String recordStr = parseBulkRecords(commandDetail);
        BulkObjectChangeSet bulkObjectChangeSet = new BulkObjectChangeSet(recordStr);
        return new InformixBulkUpdateCommand(table, bulkObjectChangeSet, parsePrimaryKey(commandDetail));
    }
}