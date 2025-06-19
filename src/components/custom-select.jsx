import * as Select from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import React from "react";

export function CustomSelect({ value, onChange, options, placeholder }) {
  return (
    <Select.Root value={value} onValueChange={onChange}>
      <Select.Trigger className="flex items-center justify-between w-full p-2 border rounded bg-gray-800 text-white">
        <Select.Value placeholder={placeholder} />
        <Select.Icon>
          <ChevronDown className="w-4 h-4" />
        </Select.Icon>
      </Select.Trigger>

      <Select.Portal>
        <Select.Content className="bg-white rounded shadow-lg">
          <Select.Viewport>
            {options.map((option) => (
              <Select.Item
                key={option.value}
                value={option.value}
                className="p-2 hover:bg-gray-200 flex items-center justify-between"
              >
                <Select.ItemText>{option.label}</Select.ItemText>
                <Select.ItemIndicator>
                  <Check className="w-4 h-4 text-green-500" />
                </Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}
