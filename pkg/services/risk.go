package services

import (
	"sort"

	"github.com/lubasinkal/v-star/pkg/risk"
	"v-desktop/pkg/models"
)

type RiskService struct{}

func NewRiskService() *RiskService {
	return &RiskService{}
}

func (s *RiskService) ComputeRiskMetrics(losses []float64) models.RiskResponse {
	if len(losses) == 0 {
		return models.RiskResponse{}
	}
	report := risk.ComputeReport(losses)
	return models.RiskResponse{RiskReport: report}
}

func (s *RiskService) VaR(losses []float64, confidence float64) float64 {
	return risk.VaR(losses, confidence)
}

func (s *RiskService) CTE(losses []float64, confidence float64) float64 {
	return risk.CTE(losses, confidence)
}

func (s *RiskService) SortLosses(losses []float64) []float64 {
	sorted := make([]float64, len(losses))
	copy(sorted, losses)
	sort.Float64s(sorted)
	return sorted
}
