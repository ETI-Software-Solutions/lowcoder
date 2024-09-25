package org.lowcoder.sdk.plugin.informix;

import lombok.experimental.SuperBuilder;
import lombok.extern.jackson.Jacksonized;
import lombok.extern.slf4j.Slf4j;
import org.lowcoder.sdk.exception.PluginCommonError;
import org.lowcoder.sdk.plugin.common.sql.SqlBasedDatasourceConnectionConfig;

import java.util.Map;

import static org.lowcoder.sdk.util.ExceptionUtils.ofPluginException;
import static org.lowcoder.sdk.util.JsonUtils.fromJson;
import static org.lowcoder.sdk.util.JsonUtils.toJson;

@Slf4j
@SuperBuilder
@Jacksonized
public class InformixDatasourceConfig extends SqlBasedDatasourceConnectionConfig {

    private static final long DEFAULT_PORT = 9000L;

    @Override
    protected long defaultPort() {
        return DEFAULT_PORT;
    }

    public static org.lowcoder.sdk.plugin.informix.InformixDatasourceConfig buildFrom(Map<String, Object> requestMap) {
        org.lowcoder.sdk.plugin.informix.InformixDatasourceConfig result = fromJson(toJson(requestMap), org.lowcoder.sdk.plugin.informix.InformixDatasourceConfig.class);
        if (result == null) {
            throw ofPluginException(PluginCommonError.DATASOURCE_ARGUMENT_ERROR, "INVALID_INFORMIX_CONFIG");
        }
        return result;
    }
}

