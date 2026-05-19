package models

import "github.com/lubasinkal/v-star/pkg/risk"

type PVRequest struct {
	InterestRate float64    `json:"interestRate"`
	RateJ        float64    `json:"rateJ,omitempty"`
	Records      []PVRecord `json:"records"`
}

type PVRecord struct {
	SumAssured float64 `json:"sumAssured"`
	Term       int     `json:"term"`
	Age        int     `json:"age,omitempty"`
}

type PVResponse struct {
	Results []PVResult `json:"results"`
}

type PVResult struct {
	Index       int     `json:"index"`
	SumAssured  float64 `json:"sumAssured"`
	Term        int     `json:"term"`
	PresentValue float64 `json:"presentValue"`
}

type AnnuityRequest struct {
	TableName string  `json:"tableName"`
	Type      string  `json:"type"`
	Age       int     `json:"age"`
	Term      int     `json:"term"`
	Deferment int     `json:"deferment"`
	Amount    float64 `json:"amount"`
	Rate      float64 `json:"rate"`
}

type AnnuityResponse struct {
	PresentValue float64 `json:"presentValue"`
}

type MortalityTableInfo struct {
	Name string `json:"name"`
	Size int    `json:"size"`
}

type TableDataRequest struct {
	Name string `json:"name"`
}

type TableDataResponse struct {
	Name   string    `json:"name"`
	Ages   []int     `json:"ages"`
	Qx     []float64 `json:"qx"`
	Lx     []float64 `json:"lx"`
	Ex     []float64 `json:"ex"`
	MaxAge int       `json:"maxAge"`
}

type ReserveRequest struct {
	Age        int     `json:"age"`
	Term       int     `json:"term"`
	SumAssured float64 `json:"sumAssured"`
	Premium    float64 `json:"premium"`
	Expenses   float64 `json:"expenses"`
	Rate       float64 `json:"rate"`
	TableName  string  `json:"tableName"`
	Type       string  `json:"type"`
}

type ReserveResponse struct {
	Value float64 `json:"value"`
	Type  string  `json:"type"`
}

type MonteCarloRequest struct {
	Model          string  `json:"model"`
	InitialRate    float64 `json:"initialRate"`
	Drift          float64 `json:"drift"`
	Volatility     float64 `json:"volatility"`
	LongTermMean   float64 `json:"longTermMean"`
	MeanReversion  float64 `json:"meanReversion"`
	NumPaths       int     `json:"numPaths"`
	Steps          int     `json:"steps"`
	Dt             float64 `json:"dt"`
	Seed           int64   `json:"seed"`
}

type PathPoint struct {
	Step   int     `json:"step"`
	Values []float64 `json:"values"`
}

type MonteCarloResponse struct {
	Paths            []PathPoint `json:"paths"`
	FinalValues      []float64   `json:"finalValues"`
	SamplePathsCount int         `json:"samplePathsCount"`
}

type RiskRequest struct {
	Losses []float64 `json:"losses"`
}

type RiskResponse struct {
	risk.RiskReport
}

type CensusRequest struct {
	FilePath     string  `json:"filePath"`
	InterestRate float64 `json:"interestRate"`
	RateJ        float64 `json:"rateJ"`
	Limit        int     `json:"limit"`
	Workers      int     `json:"workers"`
}

type CensusRecordResult struct {
	Sex          string  `json:"sex"`
	PolicyType   string  `json:"policyType"`
	Age          int     `json:"age"`
	SumAssured   float64 `json:"sumAssured"`
	Term         int     `json:"term"`
	PresentValue float64 `json:"presentValue"`
}

type CensusResponse struct {
	Records        []CensusRecordResult `json:"records"`
	TotalPV        float64              `json:"totalPV"`
	RecordCount    int                  `json:"recordCount"`
	ProcessingMs   int64                `json:"processingMs"`
}

type RateConvertRequest struct {
	FromValue   float64 `json:"fromValue"`
	FromType    string  `json:"fromType"`
	Compounding int     `json:"compounding"`
}

type RateConvertResponse struct {
	EffectiveRate float64 `json:"effectiveRate"`
	NominalRate   float64 `json:"nominalRate"`
	ForceOfInterest float64 `json:"forceOfInterest"`
}
