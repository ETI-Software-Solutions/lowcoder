package org.lowcoder.sdk.plugin.sqlcommand.command.informix;

import org.lowcoder.sdk.plugin.sqlcommand.GuiSqlCommand;
import org.lowcoder.sdk.plugin.sqlcommand.command.DeleteCommand;
import org.lowcoder.sdk.plugin.sqlcommand.command.informix.InformixDeleteCommand;
import org.lowcoder.sdk.plugin.sqlcommand.filter.FilterSet;

import java.util.Map;

import static org.lowcoder.sdk.plugin.sqlcommand.command.GuiConstants.INFORMIX_COLUMN_DELIMITER;
import static org.lowcoder.sdk.plugin.sqlcommand.filter.FilterSet.parseFilterSet;

public class InformixDeleteCommand extends DeleteCommand {

    protected InformixDeleteCommand(String table, FilterSet filterSet, boolean allowMultiModify) {
        super(table, filterSet, allowMultiModify, INFORMIX_COLUMN_DELIMITER, INFORMIX_COLUMN_DELIMITER);
    }

    public static DeleteCommand from(Map<String, Object> commandDetail) {
        String table = GuiSqlCommand.parseTable(commandDetail);
        FilterSet filterSet = parseFilterSet(commandDetail);
        boolean allowMultiModify = GuiSqlCommand.parseAllowMultiModify(commandDetail);
        return new InformixDeleteCommand(table, filterSet, allowMultiModify);
    }
}
