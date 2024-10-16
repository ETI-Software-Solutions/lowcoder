package org.lowcoder.plugin.informix;

import org.lowcoder.plugin.informix.model.InformixDatasourceConfig;
import org.lowcoder.plugin.sql.SqlBasedConnector;

import com.zaxxer.hikari.HikariConfig;
import org.apache.commons.lang3.StringUtils;
import org.pf4j.Extension;

import static org.apache.commons.lang3.StringUtils.isNotBlank;

@Extension
public class InformixConnector extends SqlBasedConnector<InformixDatasourceConfig> {

    private static final String JDBC_DRIVER = "com.informix.jdbc.IfxDriver";

    public InformixConnector() {
        super(50);
    }

    @Override
    protected String getJdbcDriver() {
        return JDBC_DRIVER;
    }

    @Override
    protected void setUpConfigs(InformixDatasourceConfig datasourceConfig, HikariConfig config) {
        // Set authentication properties
        String username = datasourceConfig.getUsername();
        if (StringUtils.isNotEmpty(username)) {
            config.setUsername(username);
        }
        String password = datasourceConfig.getPassword();
        if (StringUtils.isNotEmpty(password)) {
            config.setPassword(password);
        }

        String host = datasourceConfig.getHost();
        long port = datasourceConfig.getPort();
        String database = datasourceConfig.getDatabase();
        String url = "jdbc:informix-sqli://" + host + ":" + port + "/" + (isNotBlank(database) ? database : "");
        config.setJdbcUrl(url);

        config.addDataSourceProperty("zeroDateTimeBehavior", "convertToNull");
        config.addDataSourceProperty("allowMultiQueries", "true");

        if (datasourceConfig.isUsingSsl()) {
            config.addDataSourceProperty("useSSL", "true");
            config.addDataSourceProperty("requireSSL", "true");
        } else {
            config.addDataSourceProperty("useSSL", "false");
            config.addDataSourceProperty("requireSSL", "false");
        }
        config.setReadOnly(datasourceConfig.isReadonly());
    }
}
