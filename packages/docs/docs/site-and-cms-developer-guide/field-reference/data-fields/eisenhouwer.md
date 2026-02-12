---
sidebar_position: 18
---

# Eisenhouwer

The eisenhouwer field (also known as Eisenhower Matrix or Priority Matrix) provides an interactive canvas for prioritizing tasks or items using a 2x2 grid based on importance and urgency. Items can be dragged and positioned on the canvas.

:::info Field Type
**Type:** `eisenhouwer`  
**Category:** Data Field  
**Output:** Complex object with coordinates  
**Version:** Available since Quiqr v0.18.10  
**Note:** This is a specialized field - see kitchensink examples for detailed configuration
:::

## Basic Concept

The Eisenhower Matrix divides tasks into four quadrants:

| | Urgent | Not Urgent |
|---|---|---|
| **Important** | Do Now | Plan |
| **Not Important** | Delegate | Delete |

## Visual Example

![Eisenhouwer Field](/img/fields/eisenhouwer.png)

Items can be dragged within the canvas and positioned based on their importance (Y-axis) and urgency (X-axis).

## Properties

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `key` | string | Yes | - | Unique identifier for the field |
| `title` | string | No | - | Label displayed above the field |
| `tip` | string | No | - | Help text shown as a tooltip |
| `xScaleTitle` | string | No | - | Label for X-axis (e.g., "Urgency") |
| `yScaleTitle` | string | No | - | Label for Y-axis (e.g., "Importance") |
| `labelDoNow` | string | No | "Do Now" | Label for urgent + important quadrant |
| `labelToPlan` | string | No | "To Plan" | Label for not urgent + important quadrant |
| `labelDelegate` | string | No | "Delegate" | Label for urgent + not important quadrant |
| `labelDelete` | string | No | "Delete" | Label for not urgent + not important quadrant |
| `dataSetsPath` | string | Yes | - | Path to data sets |
| `dataSetsKeyToLabel` | boolean | No | false | Use key as label for data sets |
| `dataSetsLabelPath` | string | No | - | Path to dataset label within each dataset |
| `dataSetsDataPointsPath` | string | Yes | - | Path to data points within each dataset |
| `dataSetsDataPointsKeyToItem` | boolean | No | false | Use key as item identifier |
| `dataSetsDataPointPosXPath` | string | Yes | - | Path to X coordinate |
| `dataSetsDataPointPosYPath` | string | Yes | - | Path to Y coordinate |
| `dataSetsDataPointLabelTemplate` | string | No | - | Template for data point labels |

## Simple Example

```yaml
- key: garden-tasks
  type: eisenhouwer
  title: Garden Task Priorities
  xScaleTitle: "Urgency"
  yScaleTitle: "Importance"
  dataSetsPath: "tasks"
  dataSetsLabelPath: "category"
  dataSetsDataPointsPath: "items"
  dataSetsDataPointPosXPath: "urgency"
  dataSetsDataPointPosYPath: "importance"
  dataSetsDataPointLabelTemplate: "{{title}}"
```

**Data Structure:**
```yaml
tasks:
  - category: "Maintenance"
    items:
      - title: "Water plants"
        urgency: 80
        importance: 90
      - title: "Mow lawn"
        urgency: 60
        importance: 50
```

## Complex Example: AWS Well-Architected Framework

This example shows a complex nested structure for AWS service prioritization:

```yaml
- key: aws-services
  type: eisenhouwer
  title: AWS Service Priorities
  xScaleTitle: "Implementation Urgency"
  yScaleTitle: "Business Impact"
  labelDoNow: "Implement Now"
  labelToPlan: "Plan & Schedule"
  labelDelegate: "Team Task"
  labelDelete: "Deprioritize"
  dataSetsPath: "pillars"
  dataSetsKeyToLabel: false
  dataSetsLabelPath: "pillar_name"
  dataSetsDataPointsPath: "categories.services"
  dataSetsDataPointsKeyToItem: true
  dataSetsDataPointPosXPath: "urgency"
  dataSetsDataPointPosYPath: "impact"
  dataSetsDataPointLabelTemplate: "{{service_name}}"
```

**Data Structure:**
```yaml
pillars:
  - pillar_name: "Security"
    categories:
      services:
        iam:
          service_name: "IAM"
          urgency: 95
          impact: 100
        kms:
          service_name: "KMS"
          urgency: 70
          impact: 85
  - pillar_name: "Reliability"
    categories:
      services:
        cloudwatch:
          service_name: "CloudWatch"
          urgency: 80
          impact: 90
```

## Label Template Syntax

Use Mustache-style templates to format data point labels:

```yaml
dataSetsDataPointLabelTemplate: "{{title}}"
dataSetsDataPointLabelTemplate: "{{name}} - {{status}}"
dataSetsDataPointLabelTemplate: "{{project}}: {{task}}"
```

## Use Cases

### Project Task Prioritization

```yaml
- key: project-tasks
  type: eisenhouwer
  title: Project Task Priorities
  xScaleTitle: "Deadline Urgency"
  yScaleTitle: "Project Impact"
  dataSetsPath: "sprints"
  dataSetsLabelPath: "sprint_name"
  dataSetsDataPointsPath: "tasks"
  dataSetsDataPointPosXPath: "urgency"
  dataSetsDataPointPosYPath: "impact"
  dataSetsDataPointLabelTemplate: "{{task_name}}"
```

### Feature Roadmap

```yaml
- key: features
  type: eisenhouwer
  title: Feature Roadmap
  xScaleTitle: "Time Sensitivity"
  yScaleTitle: "User Value"
  labelDoNow: "Build Now"
  labelToPlan: "Roadmap"
  labelDelegate: "Community"
  labelDelete: "Won't Do"
  dataSetsPath: "categories"
  dataSetsLabelPath: "name"
  dataSetsDataPointsPath: "features"
  dataSetsDataPointPosXPath: "time_sensitivity"
  dataSetsDataPointPosYPath: "user_value"
  dataSetsDataPointLabelTemplate: "{{feature_name}}"
```

### Bug Triage

```yaml
- key: bugs
  type: eisenhouwer
  title: Bug Priority Matrix
  xScaleTitle: "Severity"
  yScaleTitle: "User Impact"
  labelDoNow: "Critical"
  labelToPlan: "Important"
  labelDelegate: "Low Priority"
  labelDelete: "Won't Fix"
  dataSetsPath: "components"
  dataSetsLabelPath: "component_name"
  dataSetsDataPointsPath: "bugs"
  dataSetsDataPointPosXPath: "severity"
  dataSetsDataPointPosYPath: "impact"
  dataSetsDataPointLabelTemplate: "{{bug_id}}: {{title}}"
```

## How It Works

1. **Data Sets:** Organize items into categories (e.g., by sprint, component, pillar)
2. **Data Points:** Individual items within each dataset
3. **Positioning:** Each data point has X (urgency) and Y (importance) coordinates (0-100)
4. **Dragging:** Users can drag points to reposition them
5. **Output:** Coordinates are saved back to the data structure

## Coordinate System

- **X-axis (0-100):** Left (0) = Not Urgent, Right (100) = Very Urgent
- **Y-axis (0-100):** Bottom (0) = Not Important, Top (100) = Very Important

Quadrants:
- **Top-Right (High X, High Y):** Do Now
- **Top-Left (Low X, High Y):** Plan
- **Bottom-Right (High X, Low Y):** Delegate
- **Bottom-Left (Low X, Low Y):** Delete

## Best Practices

1. **Clear Axis Labels:** Use descriptive `xScaleTitle` and `yScaleTitle`
2. **Meaningful Quadrants:** Customize quadrant labels for your context
3. **Structured Data:** Organize data hierarchically for better management
4. **Label Templates:** Create clear, concise data point labels
5. **Initial Positioning:** Set reasonable default coordinates for new items

## Output

The field outputs complex nested structures with coordinates:

```yaml
garden-tasks:
  - category: "Maintenance"
    items:
      - title: "Water plants"
        urgency: 80
        importance: 90
      - title: "Mow lawn"
        urgency: 60
        importance: 50

aws-services:
  pillars:
    - pillar_name: "Security"
      categories:
        services:
          iam:
            service_name: "IAM"
            urgency: 95
            impact: 100
```

:::tip Complex Configuration
The eisenhouwer field is highly configurable but complex. Refer to the kitchensink examples in the Quiqr Desktop repository for complete working examples.
:::

## Limitations

1. **Complexity:** Requires understanding of nested data structures
2. **Configuration:** Many properties needed for advanced use cases
3. **Data Management:** Manual data structure setup required
4. **Visualization Only:** Doesn't enforce workflow actions

## Related Fields

- [List](../container-fields/leaf-array.md) - For simple ordered lists
- [Object](../container-fields/section.md) - For grouped data
- [Nested](../container-fields/nested.md) - For hierarchical data
