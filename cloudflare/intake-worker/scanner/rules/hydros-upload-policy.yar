rule HYDROS_Embedded_PE_Executable
{
  meta:
    description = "Detect PE executable content embedded in an uploaded document/archive"
  strings:
    $mz = { 4D 5A }
    $pe = { 50 45 00 00 }
  condition:
    $mz at 0 or ($mz and $pe)
}

rule HYDROS_Suspicious_PowerShell_Text
{
  meta:
    description = "Flag common PowerShell execution markers in uploads"
  strings:
    $a = "powershell" nocase
    $b = "Invoke-Expression" nocase
    $c = "IEX(" nocase
    $d = "-EncodedCommand" nocase
  condition:
    2 of them
}
