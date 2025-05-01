import { CHAIN_LIST } from "@tokenpocket/constanst/src/chain";
import { useMemo } from "react";
import type { EVMTransportData, ITransportData } from "tp-mcp-wallet/src/type";
import { Zap, Key, Info, FileText } from "lucide-react";
import type { ITransportMessage } from "../type";

export const ActionDisplay: React.FC<{ data: ITransportMessage }> = ({
  data,
}) => {
  const chainInfo = useMemo(() => {
    if (!data?.chainId) return null;
    return CHAIN_LIST.find((chain) => `${chain.id}` === `${data.chainId}`);
  }, [data?.chainId]);

  // Function to get method type badge
  const getMethodTypeBadge = (method: string) => {
    if (["eth_sendTransaction", "eth_signTransaction"].includes(method)) {
      return (
        <span className="bg-orange-100 text-orange-800 text-xs font-semibold py-1 px-2.5 rounded-full">
          Write
        </span>
      );
    }

    if (["eth_sign", "personal_sign", "eth_signTypedData"].includes(method)) {
      return (
        <span className="bg-purple-100 text-purple-800 text-xs font-semibold py-1 px-2.5 rounded-full">
          Sign
        </span>
      );
    }

    return (
      <span className="bg-blue-100 text-blue-800 text-xs font-semibold py-1 px-2.5 rounded-full">
        Read
      </span>
    );
  };

  // Format hex to human readable (basic version)
  const formatHexValue = (hexValue: string) => {
    if (!hexValue || !hexValue.startsWith("0x")) return hexValue;
    try {
      const value = Number.parseInt(hexValue, 16);
      return `${hexValue} (${value.toLocaleString()})`;
    } catch (e) {
      return hexValue;
    }
  };

  if (chainInfo?.network === "evm") {
    const evmData = data.decryptReq?.data as EVMTransportData;

    return (
      <div className="p-5 rounded-lg border border-gray-200 bg-white mt-4">
        <div className="flex justify-between items-center mb-5">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-gray-800">EVM Request</h3>
            {getMethodTypeBadge(evmData.method)}
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-sm text-gray-600">
              {chainInfo?.name || "Unknown Chain"}
            </span>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="flex items-center border-b border-gray-100 pb-3">
            <span className="font-medium w-28 text-gray-600">Network:</span>
            <span className="text-gray-800">EVM</span>
          </div>

          <div className="flex items-center border-b border-gray-100 pb-3">
            <span className="font-medium w-28 text-gray-600">Chain:</span>
            <span className="text-gray-800">
              {chainInfo?.name || "Unknown"}
              {chainInfo?.id && (
                <span className="text-xs text-gray-500 ml-2">
                  (ID: {chainInfo.id})
                </span>
              )}
            </span>
          </div>

          <div className="flex items-center border-b border-gray-100 pb-3">
            <span className="font-medium w-28 text-gray-600">Method:</span>
            <span className="text-gray-800 font-mono bg-gray-50 px-3 py-1 rounded-md border border-gray-200">
              {evmData.method}
            </span>
          </div>

          {evmData.params && (
            <div className="border-b border-gray-100 pb-3">
              <div className="font-medium text-gray-600 mb-2">Params:</div>
              <pre className="bg-gray-50 p-4 rounded-lg overflow-auto text-sm max-h-48 border border-gray-200">
                {JSON.stringify(evmData.params, null, 2)}
              </pre>
            </div>
          )}

          {/* eth_sendTransaction or eth_signTransaction */}
          {["eth_sendTransaction", "eth_signTransaction"].includes(
            evmData.method,
          ) &&
            evmData.params &&
            Array.isArray(evmData.params) &&
            evmData.params[0] && (
              <div className="pt-1">
                <h4 className="font-medium text-gray-800 mb-3 flex items-center">
                  <Zap
                    className="h-5 w-5 mr-2 text-blue-500"
                    aria-hidden="true"
                  />
                  Transaction Details
                </h4>
                <div className="bg-gray-50 p-4 rounded-lg grid gap-3 border border-gray-200">
                  {evmData.params[0].to && (
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-600">
                        To:
                      </span>
                      <span className="font-mono text-sm break-all mt-1 p-2 bg-white rounded border border-gray-100">
                        {evmData.params[0].to}
                      </span>
                    </div>
                  )}
                  {evmData.params[0].from && (
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-600">
                        From:
                      </span>
                      <span className="font-mono text-sm break-all mt-1 p-2 bg-white rounded border border-gray-100">
                        {evmData.params[0].from}
                      </span>
                    </div>
                  )}
                  {evmData.params[0].value && (
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-600">
                        Value:
                      </span>
                      <span className="font-mono text-sm mt-1 p-2 bg-white rounded border border-gray-100">
                        {formatHexValue(evmData.params[0].value)} wei
                      </span>
                    </div>
                  )}
                  {evmData.params[0].gas && (
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-600">
                        Gas Limit:
                      </span>
                      <span className="font-mono text-sm mt-1 p-2 bg-white rounded border border-gray-100">
                        {formatHexValue(evmData.params[0].gas)}
                      </span>
                    </div>
                  )}
                  {evmData.params[0].gasPrice && (
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-600">
                        Gas Price:
                      </span>
                      <span className="font-mono text-sm mt-1 p-2 bg-white rounded border border-gray-100">
                        {formatHexValue(evmData.params[0].gasPrice)} wei
                      </span>
                    </div>
                  )}
                  {evmData.params[0].maxFeePerGas && (
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-600">
                        Max Fee Per Gas:
                      </span>
                      <span className="font-mono text-sm mt-1 p-2 bg-white rounded border border-gray-100">
                        {formatHexValue(evmData.params[0].maxFeePerGas)} wei
                      </span>
                    </div>
                  )}
                  {evmData.params[0].maxPriorityFeePerGas && (
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-600">
                        Max Priority Fee:
                      </span>
                      <span className="font-mono text-sm mt-1 p-2 bg-white rounded border border-gray-100">
                        {formatHexValue(evmData.params[0].maxPriorityFeePerGas)}{" "}
                        wei
                      </span>
                    </div>
                  )}
                  {evmData.params[0].data && (
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-600">
                        Data:
                      </span>
                      <span className="font-mono text-sm break-all mt-1 p-2 bg-white rounded border border-gray-100">
                        {evmData.params[0].data}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

          {/* eth_sign, personal_sign */}
          {["eth_sign", "personal_sign"].includes(evmData.method) &&
            evmData.params &&
            Array.isArray(evmData.params) && (
              <div className="pt-1">
                <h4 className="font-medium text-gray-800 mb-3 flex items-center">
                  <Key
                    className="h-5 w-5 mr-2 text-purple-500"
                    aria-hidden="true"
                  />
                  Signature Details
                </h4>
                <div className="bg-gray-50 p-4 rounded-lg grid gap-3 border border-gray-200">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-600">
                      Address:
                    </span>
                    <span className="font-mono text-sm break-all mt-1 p-2 bg-white rounded border border-gray-100">
                      {evmData.params[0]}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-600">
                      Message:
                    </span>
                    <span className="font-mono text-sm break-all mt-1 p-2 bg-white rounded border border-gray-100">
                      {evmData.params[1]}
                    </span>
                  </div>
                  {evmData.method === "personal_sign" && (
                    <div className="mt-2 text-xs text-gray-500 bg-blue-50 p-3 rounded-lg border border-blue-100">
                      <p className="flex items-center">
                        <Info
                          className="h-4 w-4 mr-1 text-blue-500"
                          aria-hidden="true"
                        />
                        The message will be prefixed with the standard Ethereum
                        message prefix before signing.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

          {/* eth_signTypedData */}
          {evmData.method === "eth_signTypedData" &&
            evmData.params &&
            Array.isArray(evmData.params) && (
              <div className="pt-1">
                <h4 className="font-medium text-gray-800 mb-3 flex items-center">
                  <FileText
                    className="h-5 w-5 mr-2 text-green-500"
                    aria-hidden="true"
                  />
                  Typed Data Signature
                </h4>
                <div className="bg-gray-50 p-4 rounded-lg grid gap-3 border border-gray-200">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-600">
                      Address:
                    </span>
                    <span className="font-mono text-sm break-all mt-1 p-2 bg-white rounded border border-gray-100">
                      {evmData.params[0]}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-600">
                      Domain:
                    </span>
                    {typeof evmData.params[1] === "object" &&
                      evmData.params[1]?.domain && (
                        <pre className="text-xs mt-1 p-2 bg-white rounded border border-gray-100 overflow-auto">
                          {JSON.stringify(evmData.params[1].domain, null, 2)}
                        </pre>
                      )}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-600">
                      Message:
                    </span>
                    {typeof evmData.params[1] === "object" &&
                      evmData.params[1]?.message && (
                        <pre className="text-xs mt-1 p-2 bg-white rounded border border-gray-100 overflow-auto">
                          {JSON.stringify(evmData.params[1].message, null, 2)}
                        </pre>
                      )}
                  </div>
                </div>
              </div>
            )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 rounded-lg border border-gray-200 bg-white">
      <div className="flex items-center gap-3 mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Request Details</h3>
        <span className="bg-gray-100 text-gray-600 text-xs font-semibold py-1 px-2.5 rounded-full">
          {chainInfo?.network}
        </span>
      </div>
      
      <div className="mt-4 bg-gray-50 p-4 rounded-lg overflow-auto text-sm border border-gray-200  ">
        <pre>{JSON.stringify(data.decryptReq?.data, null, 2)}</pre>
      </div>
    </div>
  );
};
