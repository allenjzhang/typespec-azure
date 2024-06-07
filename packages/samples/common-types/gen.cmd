echo off
rd .\tsp-output\ -Recurse -Confirm:$false

echo "Compiling managed-identity"
cmd /c "npx tsp compile . --import ../../typespec-azure-resource-manager/lib/common-types/managed-identity.tsp --options @azure-tools/typespec-autorest.output-file={version}/managedidentity.json" || echo "Warning: managed-identity compilation failed"

echo "Compiling types"
cmd /c "npx tsp compile . --import ./types-gen.tsp --options @azure-tools/typespec-autorest.output-file={version}/types.json" || echo "Warning: types compilation failed"

echo "Compiling private-links"
cmd /c "npx tsp compile . --import ./private-links-gen.tsp --options @azure-tools/typespec-autorest.output-file={version}/privatelinks.json" || echo "Warning: private-links compilation failed"


echo "Compiling customer-managed-keys"
cmd /c "npx tsp compile . --import ./customer-managed-keys-gen.tsp --options @azure-tools/typespec-autorest.output-file={version}/customermanagedkeys.json" || echo "Warning: customer-managed-keys compilation failed"

#npm start  .\resource-management
