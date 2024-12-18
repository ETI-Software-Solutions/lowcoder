package org.lowcoder.plugin.informix.utils;

import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.SQLException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.Map;

import static org.lowcoder.plugin.informix.utils.InformixStructureParser.DATETIME_COLUMN_TYPE_NAME;
import static org.lowcoder.plugin.informix.utils.InformixStructureParser.DATE_COLUMN_TYPE_NAME;
import static org.lowcoder.sdk.util.DateTimeUtils.DATE_TIME_FORMAT;
import static org.lowcoder.plugin.informix.utils.InformixStructureParser.TIMESTAMP_COLUMN_TYPE_NAME;

public class InformixResultParser {

    public static Map<String, Object> parseRowValue(ResultSet resultSet, ResultSetMetaData metaData, int colCount)
            throws SQLException {

        Map<String, Object> row = new LinkedHashMap<>(colCount);

        for (int i = 1; i <= colCount; i++) {

            String columnLabel = metaData.getColumnLabel(i);
            String typeName = metaData.getColumnTypeName(i);
            Object value = getValueByType(resultSet, i, typeName);
            row.put(columnLabel, value);
        }

        return row;
    }

    private static Object getValueByType(ResultSet resultSet, int i, String typeName) throws SQLException {
        if (resultSet.getObject(i) == null) {
            return null;
        }
        if (DATE_COLUMN_TYPE_NAME.equalsIgnoreCase(typeName)) {
            return DateTimeFormatter.ISO_DATE.format(resultSet.getDate(i).toLocalDate());
        }
        if (DATETIME_COLUMN_TYPE_NAME.equalsIgnoreCase(typeName)
                || TIMESTAMP_COLUMN_TYPE_NAME.equalsIgnoreCase(typeName)) {
            return DATE_TIME_FORMAT
                    .format(LocalDateTime.of(resultSet.getDate(i).toLocalDate(), resultSet.getTime(i).toLocalTime()));
        }
        if ("year".equalsIgnoreCase(typeName)) {
            return resultSet.getDate(i).toLocalDate().getYear();
        }
        return resultSet.getObject(i);

    }
}