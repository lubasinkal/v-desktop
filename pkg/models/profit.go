package models

// ProfitRequest represents a profit test request from the frontend.
type ProfitRequest struct {
	TableName       string  `json:"tableName"`
	Age             int     `json:"age"`
	Term            int     `json:"term"`
	SumAssured      float64 `json:"sumAssured"`
	Premium         float64 `json:"premium"`
	EarnedRate      float64 `json:"earnedRate"`
	DiscountRate    float64 `json:"discountRate"`
	AcquisitionExp  float64 `json:"acquisitionExp"`
	RenewalExp      float64 `json:"renewalExp"`
	CommissionRate  float64 `json:"commissionRate"`
	CommissionYears int     `json:"commissionYears"`
	ReserveEnabled  bool    `json:"reserveEnabled"`
}

// ProfitResponse holds the full output of a profit test, serialized for the frontend.
type ProfitResponse struct {
	ProfitSignature  []float64 `json:"profitSignature"`
	CumulativeProfit []float64 `json:"cumulativeProfit"`
	PVOfProfits      float64   `json:"pvOfProfits"`
	PVOfPremiums     float64   `json:"pvOfPremiums"`
	ProfitMargin     float64   `json:"profitMargin"`
	IRR              float64   `json:"irr"`
	PaybackYear      int       `json:"paybackYear"`
}
