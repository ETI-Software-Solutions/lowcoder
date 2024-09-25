package org.lowcoder.sdk.plugin.sqlcommand.command.informix;

import com.google.common.annotations.VisibleForTesting;
import org.lowcoder.sdk.plugin.sqlcommand.changeset.ChangeSet;
import org.lowcoder.sdk.plugin.sqlcommand.command.UpdateCommand;
import org.lowcoder.sdk.plugin.sqlcommand.filter.FilterSet;

import java.util.Map;

import static org.lowcoder.sdk.plugin.sqlcommand.command.GuiConstants.INFORMIX_COLUMN_DELIMITER;

public class InformixUpdateCommand extends UpdateCommand {

    private InformixUpdateCommand(Map<String, Object> commandDetail) {
        super(commandDetail, INFORMIX_COLUMN_DELIMITER, INFORMIX_COLUMN_DELIMITER);
    }

    @VisibleForTesting
    protected InformixUpdateCommand(String table, ChangeSet changeSet, FilterSet filterSet, boolean allowMultiModify) {
        super(table, changeSet, filterSet, allowMultiModify, INFORMIX_COLUMN_DELIMITER, INFORMIX_COLUMN_DELIMITER);
    }

    public static InformixUpdateCommand from(Map<String, Object> commandDetail) {
        return new InformixUpdateCommand(commandDetail);
    }
}
