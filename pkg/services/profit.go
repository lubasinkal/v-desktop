package services

import (
	"fmt"

	"github.com/lubasinkal/v-star/pkg/profit"
	"v-desktop/pkg/models"
)

// ProfitService wraps v-star profit testing for the desktop app.
type ProfitService struct {
	mortSvc *MortalityService
}

// NewProfitService creates a profit service that uses the mortality service
// for table lookups.
func NewProfitService(mortSvc *MortalityService) *ProfitService {
	return &ProfitService{mortSvc: mortSvc}
}

// RunProfitTest executes a profit test and returns serializable results.
func (s *ProfitService) RunProfitTest(req models.ProfitRequest) (*models.ProfitResponse, error) {
	// Resolve mortality table
	mort, err := s.mortSvc.GetTable(req.TableName)
	if err != nil {
		return nil, fmt.Errorf("profit test: %w", err)
	}

	// Build v-star profit assumptions
	assumptions := profit.Assumptions{
		Mortality:       mort,
		EarnedRate:      req.EarnedRate,
		DiscountRate:    req.DiscountRate,
		Expenses:        req.AcquisitionExp,
		RenewalExpense:  req.RenewalExp,
		CommissionRate:  req.CommissionRate,
		CommissionYears: req.CommissionYears,
		ReserveEnabled:  req.ReserveEnabled,
	}

	policy := profit.Policy{
		Age:        req.Age,
		Term:       req.Term,
		SumAssured: req.SumAssured,
		Premium:    req.Premium,
	}

	// Run the profit test
	results := profit.Run(policy, assumptions)

	return &models.ProfitResponse{
		ProfitSignature:  results.ProfitSignature,
		CumulativeProfit: results.CumulativeProfit,
		PVOfProfits:      results.PVOfProfits,
		PVOfPremiums:     results.PVOfPremiums,
		ProfitMargin:     results.ProfitMargin,
		IRR:              results.IRR,
		PaybackYear:      results.PaybackYear,
	}, nil
}
