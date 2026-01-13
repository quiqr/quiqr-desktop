---
title: Eisenhouwer Matrix
---

# Eisenhouwer

**Quiqr version >= 0.18.10**

The `eisenhouwer` field creates a eisenhouwer matrix canvas which allows
editors to prioritize tasks by dragging datapoints. The tasks are stored as datapoints which can
optinally contain other meta data. Existing metadata will be kept and can be
used in the data point label using the `dataSetsDataPointLabelTemplate` for
configuration.

Please also checkout the latest kitchensink template for eisenhouwer examples. This is
quite a complex datatype field.

{{< figure src="../eisenhouwer.png" caption="Font Picker" >}}

## Properties

| property                       | value type | optional                                       | description                                                                               |
|:-------------------------------|:-----------|:-----------------------------------------------|:------------------------------------------------------------------------------------------|
| key                            | string     | mandatory                                      | Keys are for internal use and must be unique                                              |
| title                          | string     | optional                                       | The title of the element                                                                  |
| tip                            | string     | optional (default: null)                       | Text entered here with markdown formatting is displayed as context help in an overlay box |
| xScaleTitle                    | string     | optional (default: null)                       | X-Axis Title, (cost)                                                                      |
| yScaleTitle                    | string     | optional (default: null)                       | Y-Axis Title, (impact)                                                                    |
| labelDoNow                     | string     | optional (default: DO NOW)                     | Quadrant top-left title                                                                   |
| labelToPlan                    | string     | optional (default: TO PLAN)                    | Quadrant top-right title                                                                  |
| labelDelegate                  | string     | optional (default: DELEGATE)                   | Quadrant bottom-left title                                                                |
| labelDelete                    | string     | optional (default: DELETE)                     | Quadrant bottom-right title                                                               |
| dataSetsPath                   | string     | optional (default: null)                       | Path in data where datasets are stored                                                    |
| dataSetsKeyToLabel             | boolean    | optional (default: false)                      | Source data is a dictionary, convert to array for Chartjs                                 |
| dataSetsLabelPath              | string     | optional (default: null)                       | Path in data where dataset-label are stored                                               |
| dataSetsDataPointsPath         | string     | optional (default: null)                       | Path in data where datapoints are stored                                                  |
| dataSetsDataPointsKeyToItem    | boolean    | optional (default: false)                      | Source data is a dictionary, convert to array for Chartjs                                 |
| dataSetsDataPointPosXPath      | string     | mandatory                                      | Path in datapoints where x-position is stored                                             |
| dataSetsDataPointPosYPath      | string     | mandatory                                      | Path in datapoints where y-position is stored                                             |
| dataSetsDataPointLabelTemplate | string     | optional (default: x=${point.x}, y=${point.y}) | Template for creating a datapoint label                                                   |

## Sample

### Configuration

{{< code-toggle file="./quiqr/model/base" >}}

key: garden_tasks
type: eisenhouwer
xScaleTitle: More Sweat
yScaleTitle: Happy Wild Life
dataSetsPath: .datasets
dataSetsKeyToLabel: false
dataSetsLabelPath: .label
dataSetsDataPointsPath: .data
dataSetsDataPointsKeyToItem: false
dataSetsDataPointPosXPath: .x
dataSetsDataPointPosYPath: .y
dataSetsDataPointLabelTemplate: "${point.task}"
{{< /code-toggle >}}

### Output

```yaml
garden_tasks:
  datasets:
    - label: Garden Tasks
      data:
        - x: 12.0
          'y': 17.6
          task: Paint the barn
        - x: 59.3
          'y': 75.5
          task: Grow strawberries
        - x: 11.2
          'y': 79.9
          task: Dig a pond
```

## Sample 2

### Configuration

{{< code-toggle file="./quiqr/model/base" >}}
key: well_architected_improvements
type: eisenhouwer
xScaleTitle: Cost of Mitigation
yScaleTitle: Risk Importance
labelDoNow: DO NOW
labelToPlan: TO PLAN
labelDelegate: DELEGATE
labelDelete: DELETE
dataSetsKeyToLabel: true
dataSetsDataPointsKeyToItem: true
dataSetsDataPointPosXPath: .REPORT.importance_number_of_100
dataSetsDataPointPosYPath: .REPORT.cost_number_of_100
dataSetsDataPointLabelTemplate: "${point.RiskCode}\n${point.QuestionTitle}"{{< /code-toggle >}}

### Output

```yaml
well_architected_improvements:
  costOptimization:
    cloud-financial-management:
      ImprovementPlanUrl: >-
        https://wa.aws.amazon.com/wellarchitected/2024-06-27T08-00-00/TypeII/en/wellarchitected/wellarchitected.cloud-financial-management.improvement-plan.en.html
      ImprovementPlans: []
      PillarId: costOptimization
      QuestionId: cloud-financial-management
      QuestionTitle: How do you implement cloud financial management?
      REPORT:
        cost_number_of_100: 76.74060382008626
        importance_number_of_100: 23.400850580624386
        short-med-long: short
        show: true
      Risk: MEDIUM
      RiskCode: COST01
      _label: cloud-financial-management
      x: 23.400850580624386
      'y': 76.74060382008626
    evaluate-cost-effort:
      ImprovementPlanUrl: >-
        https://wa.aws.amazon.com/wellarchitected/2024-06-27T08-00-00/TypeII/en/wellarchitected/wellarchitected.evaluate-cost-effort.improvement-plan.en.html
      ImprovementPlans: []
      PillarId: costOptimization
      QuestionId: evaluate-cost-effort
      QuestionTitle: How do you evaluate the cost of effort?
      REPORT:
        cost_number_of_100: 57.779886148007584
        importance_number_of_100: 25.392970613283993
        short-med-long: long
        show: true
      Risk: MEDIUM
      RiskCode: COST11
      _label: evaluate-cost-effort
      x: 25.392970613283993
      'y': 57.779886148007584
    govern-usage:
      ImprovementPlanUrl: >-
        https://wa.aws.amazon.com/wellarchitected/2024-06-27T08-00-00/TypeII/en/wellarchitected/wellarchitected.govern-usage.improvement-plan.en.html
      ImprovementPlans: []
      PillarId: costOptimization
      QuestionId: govern-usage
      QuestionTitle: How do you govern usage?
      REPORT:
        cost_number_of_100: 11.606578115117017
        importance_number_of_100: 32.231378439747424
        short-med-long: short
        show: true
      Risk: HIGH
      RiskCode: COST02
      _label: govern-usage
      x: 32.231378439747424
      'y': 11.606578115117017
    manage-demand-resources:
      ImprovementPlanUrl: >-
        https://wa.aws.amazon.com/wellarchitected/2024-06-27T08-00-00/TypeII/en/wellarchitected/wellarchitected.manage-demand-resources.improvement-plan.en.html
      ImprovementPlans: []
      PillarId: costOptimization
      QuestionId: manage-demand-resources
      QuestionTitle: How do you manage demand, and supply resources?
      REPORT:
        cost_number_of_100: 89.52556993222429
        importance_number_of_100: 9.406125135072086
        short-med-long: long
        show: true
      Risk: HIGH
      RiskCode: COST09
      _label: manage-demand-resources
      x: 9.406125135072086
      'y': 89.52556993222429
    monitor-usage:
      ImprovementPlanUrl: >-
        https://wa.aws.amazon.com/wellarchitected/2024-06-27T08-00-00/TypeII/en/wellarchitected/wellarchitected.monitor-usage.improvement-plan.en.html
      ImprovementPlans: []
      PillarId: costOptimization
      QuestionId: monitor-usage
      QuestionTitle: How do you monitor your cost and usage?
      REPORT:
        cost_number_of_100: 84.97786211258696
        importance_number_of_100: 58.14894410204381
        short-med-long: short
        show: true
      Risk: HIGH
      RiskCode: COST03
      _label: monitor-usage
      x: 58.14894410204381
      'y': 84.97786211258696
    type-size-number-resources:
      ImprovementPlanUrl: >-
        https://wa.aws.amazon.com/wellarchitected/2024-06-27T08-00-00/TypeII/en/wellarchitected/wellarchitected.type-size-number-resources.improvement-plan.en.html
      ImprovementPlans: []
      PillarId: costOptimization
      QuestionId: type-size-number-resources
      QuestionTitle: >-
        How do you meet cost targets when you select resource type, size and
        number?
      REPORT:
        cost_number_of_100: 20.517560073937158
        importance_number_of_100: 5.3496829769409855
        short-med-long: long
        show: true
      Risk: MEDIUM
      RiskCode: COST06
      _label: type-size-number-resources
      x: 5.3496829769409855
      'y': 20.517560073937158
  operationalExcellence:
    dev-integ:
      ImprovementPlanUrl: >-
        https://wa.aws.amazon.com/wellarchitected/2024-06-27T08-00-00/TypeII/en/wellarchitected/wellarchitected.dev-integ.improvement-plan.en.html
      ImprovementPlans: []
      PillarId: operationalExcellence
      QuestionId: dev-integ
      QuestionTitle: >-
        How do you reduce defects, ease remediation, and improve flow into
        production?
      REPORT:
        cost_number_of_100: 69.80899568699938
        importance_number_of_100: 9.473732504374272
        short-med-long: short
        show: true
      Risk: MEDIUM
      RiskCode: OPS05
      _label: dev-integ
      x: 9.473732504374272
      'y': 69.80899568699938
```
