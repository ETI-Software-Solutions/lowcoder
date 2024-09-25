package org.lowcoder.sdk.plugin.sqlcommand.command.informix;

import com.google.common.annotations.VisibleForTesting;
import org.lowcoder.sdk.plugin.sqlcommand.changeset.ChangeSet;
import org.lowcoder.sdk.plugin.sqlcommand.command.InsertCommand;

import java.util.Map;

import static org.lowcoder.sdk.plugin.sqlcommand.command.GuiConstants.INFORMIX_COLUMN_DELIMITER;

public class InformixInsertCommand extends InsertCommand {

    private InformixInsertCommand(Map<String, Object> commandDetail) {
        super(commandDetail, INFORMIX_COLUMN_DELIMITER);
    }

    @VisibleForTesting
    protected InformixInsertCommand(String table, ChangeSet changeSet) {
        super(table, changeSet, INFORMIX_COLUMN_DELIMITER, INFORMIX_COLUMN_DELIMITER);
    }

    public static InformixInsertCommand from(Map<String, Object> commandDetail) {
        return new InformixInsertCommand(commandDetail);
    }
}
