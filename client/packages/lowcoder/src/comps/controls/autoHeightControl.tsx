import { trans } from "i18n";
import { ControlParams } from "./controlParams";
import { dropdownAbstractControl } from "./dropdownControl";
import { CompParams } from "lowcoder-core";
import { JSONValue } from "util/jsonTypes";

const heightOptions = [
  {
    label: trans("autoHeightProp.auto"),
    value: "auto",
  },
  {
    label: trans("autoHeightProp.fixed"),
    value: "fixed",
  },
] as const;

const AutoHeightTmpControl = dropdownAbstractControl(heightOptions, "auto");
export class AutoHeightControl extends AutoHeightTmpControl {
  constructor(params: CompParams<JSONValue>) {
    super(params as any);
  }

  override oldValueToNew(value: any) {
    // compatible with old data
    if (typeof value === "boolean") {
      return value ? "auto" : "fixed";
    }
    return value;
  }

  override getView() {
    return this.value === "auto";
  }

  override getPropertyView() {
    return this.propertyView({ label: trans("prop.height") });
  }

  override propertyView(params: ControlParams) {
    return super.propertyView({ radioButton: true, ...params });
  }
}
