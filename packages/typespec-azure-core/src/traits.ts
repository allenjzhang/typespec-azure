import {
  DecoratorContext,
  EnumMember,
  getTypeName,
  Interface,
  Model,
  ModelProperty,
  Namespace,
  Operation,
  Program,
  setTypeSpecNamespace,
  Type,
} from "@typespec/compiler";
import { isHeader, isQueryParam } from "@typespec/http";
import { $added } from "@typespec/versioning";
import {
  TraitAddedDecorator,
  TraitContextDecorator,
  TraitDecorator,
  TraitLocationDecorator,
} from "../generated-defs/Azure.Core.Traits.js";
import {
  AddTraitPropertiesDecorator,
  ApplyTraitOverrideDecorator,
  EnsureAllHeaderParamsDecorator,
  EnsureAllQueryParamsDecorator,
  EnsureTraitsPresentDecorator,
  TraitSourceDecorator,
} from "../generated-defs/Azure.Core.Traits.Private.js";
import { AzureCoreStateKeys, reportDiagnostic } from "./lib.js";

export const $traitSource: TraitSourceDecorator = (
  context: DecoratorContext,
  target: ModelProperty,
  traitName: string,
) => {
  // Store the source trait name on the envelope property
  context.program.stateMap(AzureCoreStateKeys.traitSource).set(target, traitName);
};

/**
 * Retrieves the `traitName` stored for the given `property`, if any.
 * @param program Program object with context for the current compilation
 * @param property The model property for which the trait name should be retrieved
 */
export function getSourceTraitName(program: Program, property: ModelProperty): string | undefined {
  return program.stateMap(AzureCoreStateKeys.traitSource).get(property);
}

setTypeSpecNamespace("Traits.Private", $traitSource);

export const $trait: TraitDecorator = (
  context: DecoratorContext,
  target: Model,
  traitName?: string,
) => {
  if (target.properties.size !== 1) {
    reportDiagnostic(context.program, {
      code: "invalid-trait-property-count",
      target: target,
      format: {
        modelName: target.name,
      },
    });

    return;
  }

  // If the traitName parameter wasn't specified, use the trait type name
  traitName = traitName ?? getTypeName(target, { namespaceFilter: (ns: Namespace) => false });

  // Extract the envelope property
  const [envelopeName] = target.properties.keys();
  const envelopeProperty = target.properties.get(envelopeName)!;

  // Ensure the envelope property is a model type
  if (envelopeProperty.type.kind !== "Model") {
    reportDiagnostic(context.program, {
      code: "invalid-trait-property-type",
      target: target,
      format: {
        modelName: target.name,
        propertyName: envelopeName,
      },
    });

    return;
  }

  // Ensure that all properties in the envelope property type have a location
  for (const [_, traitProperty] of envelopeProperty.type.properties) {
    if (!getTraitLocation(context.program, traitProperty)) {
      reportDiagnostic(context.program, {
        code: "trait-property-without-location",
        target: target,
        format: {
          modelName: target.name,
          propertyName: traitProperty.name,
        },
      });
    }
  }

  // Mark the property with the trait name
  context.call($traitSource, envelopeProperty, traitName);

  // Manually push the decorator onto the property so that it's copyable when
  // using model intersections and spreads
  envelopeProperty.decorators.push({
    decorator: $traitSource,
    args: [{ value: context.program.checker.createLiteralType(traitName), jsValue: traitName }],
  });

  // Mark the model as a trait type and store its name
  context.program.stateMap(AzureCoreStateKeys.trait).set(target, traitName);
};

setTypeSpecNamespace("Traits", $trait);

/*
 * Returns true if the `model` is marked with the `@trait` decorator.
 * @param program Program object with context for the current compilation
 * @param property The model type to consider
 */
export function isTraitModel(program: Program, model: Model): boolean {
  return program.stateMap(AzureCoreStateKeys.trait).has(model) !== undefined;
}

/*
 * Returns the trait name of the model type if it was marked with `@trait`.
 * @param program Program object with context for the current compilation
 * @param property The model type to consider
 */
export function getTraitName(program: Program, model: Model): string | undefined {
  return program.stateMap(AzureCoreStateKeys.trait).get(model);
}

export const $traitContext: TraitContextDecorator = (
  context: DecoratorContext,
  target: ModelProperty,
  traitContext: Type,
) => {
  context.program
    .stateMap(AzureCoreStateKeys.traitContext)
    .set(target, normalizeTraitContexts(context.program, traitContext));
};

setTypeSpecNamespace("Traits", $traitContext);

function normalizeTraitContexts(program: Program, contexts: Type): EnumMember[] {
  if (contexts.kind === "EnumMember") {
    return [contexts];
  } else if (contexts.kind === "Union") {
    const members: EnumMember[] = [];
    for (const variant of contexts.variants.values()) {
      if (variant.type.kind === "EnumMember") {
        members.push(variant.type);
      } else {
        reportDiagnostic(program, {
          code: "invalid-trait-context",
          target: variant,
        });
      }
    }

    return members;
  } else if (contexts.kind === "Intrinsic") {
    // This is a special case: treat 'unknown' as if the user never called
    // `traitContext`.  This is used when a reusable trait type needs to convey
    // that it has no context in some cases.
    if (contexts.name !== "unknown") {
      reportDiagnostic(program, {
        code: "invalid-trait-context",
        target: contexts,
      });
    }
  }

  return [];
}

function getTraitContextsOrUndefined(
  program: Program,
  property: ModelProperty,
): EnumMember[] | undefined {
  // Sometimes we need to know whether a trait context was explicitly set on a
  // property without defaulting to an empty array
  return program.stateMap(AzureCoreStateKeys.traitContext).get(property);
}

/*
 * Retrieves the trait context stored for the given `property`, if any.  Returns
 * an empty list if no contexts are registered for the property.
 * @param program Program object with context for the current compilation
 * @param property The model property for which the trait contexts should be retrieved
 */
export function getTraitContexts(program: Program, property: ModelProperty): EnumMember[] {
  return program.stateMap(AzureCoreStateKeys.traitContext).get(property) || [];
}

export const $traitLocation: TraitLocationDecorator = (
  context: DecoratorContext,
  target: ModelProperty,
  traitLocation: EnumMember,
) => {
  context.program.stateMap(AzureCoreStateKeys.traitLocation).set(target, traitLocation);
};

setTypeSpecNamespace("Traits", $traitLocation);

/*
 * Retrieves the trait location stored for the given `property`, if any.
 * @param program Program object with context for the current compilation
 * @param property The model property for which the trait location should be retrieved
 */
export function getTraitLocation(
  program: Program,
  property: ModelProperty,
): EnumMember | undefined {
  return program.stateMap(AzureCoreStateKeys.traitLocation).get(property);
}

const traitAddedKey = Symbol("traitLocation");

export const $traitAdded: TraitAddedDecorator = (
  context: DecoratorContext,
  target: Model | ModelProperty,
  addedVersion: Type,
) => {
  if (addedVersion.kind !== "EnumMember") {
    // The type is probably "null" so don't do anything
    return;
  }

  if (target.kind === "Model") {
    if (target.properties.size !== 1) {
      // The @trait decorator has already raised a diagnostic so skip it.
      return;
    }

    // Invoke the decorator on the sole envelope property
    const envelopeProperty = target.properties.values().next().value!;
    context.call($traitAdded, envelopeProperty, addedVersion);

    // Manually push the decorator onto the property so that it's copyable when
    // using model intersections and spreads
    envelopeProperty.decorators.push({
      decorator: $traitAdded,
      args: [{ value: addedVersion, jsValue: addedVersion }],
    });
  }

  // Save the version on the envelope property so that it can be used later when
  // we copy out trait properties
  context.program.stateMap(traitAddedKey).set(target, addedVersion);
};

function getTraitAddedVersion(
  program: Program,
  envelopeProperty: ModelProperty,
): EnumMember | undefined {
  return program.stateMap(traitAddedKey).get(envelopeProperty);
}

setTypeSpecNamespace("Traits", $traitAdded);

export const $addTraitProperties: AddTraitPropertiesDecorator = (
  context: DecoratorContext,
  target: Model,
  traitModel: Model,
  traitLocation: EnumMember,
  traitContexts: Type,
) => {
  // Keep track of all traits applied
  const appliedTraits = new Set<string>();

  // Search the trait model for all trait property types that satisfy the
  // criteria for this trait location and context list
  const { program } = context;
  for (const [_, traitEnvelope] of traitModel.properties) {
    // Check whether the envelope property is marked with a traitAdded version
    const addedVersion = getTraitAddedVersion(context.program, traitEnvelope);

    // Make sure we're looking at a trait that we haven't already processed
    const traitName = getSourceTraitName(program, traitEnvelope);
    if (traitName && !appliedTraits.has(traitName)) {
      // Extract any applicable constants from the trait envelope
      const contexts = getTraitContexts(context.program, traitEnvelope);

      // Ensure that the trait envelope is actually a model
      if (traitEnvelope.type.kind !== "Model") {
        // The @trait decorator has already raised a diagnostic
        return;
      }

      // For each property in the envelope type, check if the property matches
      // the criteria of the usage site
      for (const [_, traitProperty] of traitEnvelope.type.properties) {
        // Each property inside of the trait envelope property's model can have
        // its own trait contexts which override the contexts of the trait
        // envelope.  We only apply an override if one is set, though.
        const contextsOverride = getTraitContextsOrUndefined(context.program, traitProperty);
        if (
          checkTraitPropertyCriteria(
            program,
            traitProperty,
            contextsOverride ?? contexts,
            traitLocation,
            normalizeTraitContexts(program, traitContexts),
          )
        ) {
          if (traitProperty.type.kind !== "Model") {
            // In the future, TraitType will enable passing non-model types
            // directly to a location.  Regardless, non-model types can not be
            // spread into a TraitProperties, so skip it.
            return;
          }

          // Copy the contents of the trait property's model type into the
          // target model
          for (const [name, property] of traitProperty.type.properties) {
            // TODO: This needs to use the equivalent of Checker.checkSpreadProperty
            // once a helper method is available
            target.properties.set(
              name,
              context.program.checker.cloneType(property, {
                sourceProperty: property,
                model: target,
                decorators: [
                  ...property.decorators,
                  ...(addedVersion
                    ? [
                        {
                          decorator: $added,
                          args: [{ value: addedVersion, jsValue: addedVersion }],
                        },
                      ]
                    : []),
                ],
              }),
            );

            appliedTraits.add(traitName);
          }
        }
      }
    }
  }
};

function checkTraitPropertyCriteria(
  program: Program,
  property: ModelProperty,
  traitContexts: EnumMember[],
  expectedLocation: EnumMember,
  expectedContexts: EnumMember[],
): boolean {
  const location = getTraitLocation(program, property);
  if (!location) {
    // Don't error here, the validator will take care of it
    return false;
  }

  // Traits and trait usage sites must always specify a location, so check that
  // first.  After that, check if the trait specifies any contexts.  If not, the
  // trait applies anywhere.  Otherwise, the location's contexts *must* have at
  // least one context that matches the trait's contexts.
  return (
    location === expectedLocation &&
    (traitContexts.length === 0 || !!traitContexts.find((c) => expectedContexts.indexOf(c) > -1))
  );
}

setTypeSpecNamespace("Traits.Private", $addTraitProperties);

// This variable is used globally to ensure that all overridden traits get a
// unique envelope property name.
let traitOverrideCounter = 1;

export const $applyTraitOverride: ApplyTraitOverrideDecorator = (
  context: DecoratorContext,
  target: Model,
  traitModel: Model,
) => {
  if (traitModel.properties.size !== 1) {
    // The @trait decorator has already raised a diagnostic so skip it.
    return;
  }

  // If we've already populated this type then it must have been evaluated
  // previously for the trait type
  if (target.properties.size > 0) {
    return;
  }

  // Rename the sole envelope property to make it unique
  traitOverrideCounter++;
  const [envelopeName] = traitModel.properties.keys();
  const overrideName = `${envelopeName}Override${traitOverrideCounter}`;
  const envelopeProperty = traitModel.properties.get(envelopeName)!;
  target.properties.set(
    overrideName,
    context.program.checker.cloneType(envelopeProperty, {
      name: overrideName,
      model: target,
      sourceProperty: envelopeProperty,
    }),
  );
};

setTypeSpecNamespace("Traits.Private", $applyTraitOverride);

export const $ensureTraitsPresent: EnsureTraitsPresentDecorator = (
  context: DecoratorContext,
  target: Interface | Operation,
  traitModel: Model,
  expectedTraits: Type,
) => {
  if (expectedTraits.kind !== "Tuple") {
    return;
  }

  // Gather all of the trait names from the envelope properties
  const traitsPresent = new Set();
  for (const [_, envelopeProperty] of traitModel.properties) {
    const traitName = getSourceTraitName(context.program, envelopeProperty);
    if (traitName) {
      traitsPresent.add(traitName);
    }
  }

  function getPropertyString(model: Model, propertyName: string): string | undefined {
    const val = model.properties.get(propertyName);
    return val && val.type.kind === "String" ? val.type.value : undefined;
  }

  // Check all of the expected trait types
  for (const expected of expectedTraits.values) {
    if (expected.kind === "Model") {
      // These model traits have two fields: trait and message
      const trait = getPropertyString(expected, "trait");
      if (trait && !traitsPresent.has(trait)) {
        const diagnosticName = getPropertyString(expected, "diagnostic");
        if (!diagnosticName) {
          reportDiagnostic(context.program, {
            code: "expected-trait-diagnostic-missing",
            target: expected,
          });
        } else {
          reportDiagnostic(context.program, {
            code: diagnosticName as any,
            target: target,
          });
        }
      }
    }
  }
};

setTypeSpecNamespace("Traits.Private", $ensureTraitsPresent);

export const $ensureAllQueryParams: EnsureAllQueryParamsDecorator = (
  context: DecoratorContext,
  target: Model,
  paramModel: Model,
) => {
  for (const [_, param] of paramModel.properties) {
    if (!isQueryParam(context.program, param)) {
      reportDiagnostic(context.program, {
        code: "invalid-parameter",
        target: target,
        format: {
          propertyName: param.name,
          kind: "query",
        },
      });
    }
  }
};

setTypeSpecNamespace("Traits.Private", $ensureAllQueryParams);

export const $ensureAllHeaderParams: EnsureAllHeaderParamsDecorator = (
  context: DecoratorContext,
  target: Model,
  paramModel: Model,
) => {
  for (const [_, param] of paramModel.properties) {
    if (!isHeader(context.program, param)) {
      reportDiagnostic(context.program, {
        code: "invalid-parameter",
        target: target,
        format: {
          propertyName: param.name,
          kind: "header",
        },
      });
    }
  }
};

setTypeSpecNamespace("Traits.Private", $ensureAllHeaderParams);
